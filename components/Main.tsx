import React, {useEffect,useState} from "react";
import { useKmoContext } from './context';
import {ImageElement} from './ImageElement';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Autocomplete, Container, Grid, LinearProgress, Popover } from '@mui/material';
import {ImageViewer} from "./ImageViewer"
import AddTagsModal from "./AddTags"
import { IoFilterSharp, IoAlbumsOutline, IoCloseOutline } from 'react-icons/io5';
import { BsCheck2 } from 'react-icons/bs';
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
import { IoIosSearch, IoIosShuffle } from 'react-icons/io';
import { MdOutlineSync, MdTag, MdRefresh, MdOutlineFolderOpen } from 'react-icons/md';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';

declare global {
    interface Window {
        showDirectoryPicker:any;
        showSaveFilePicker:any;
        webkitStorageInfo:any;
        PERSISTENT:any;
        requestFileSystem:any;
    }
    interface Tag {
      id: string,
      name: string,
      type: string,
      values: string[],
    }
    interface TagItem {
      id: string,
      name: string
    }
}

const Main = () => {
  const [items, setItems] = useState([]);
  const [addTagsModal, setAddTagsModal] = useState(false);
  const { 
    folder, setFolder, 
    dbHandle, setDbHandle, 
    db, setDb, 
    filesFound, setFilesFound,
    viewer, setViewer,
    file, setFile,
    cache, setCache,
    saving, setSaving,
    cacheHandle, setCacheHandle,
    syncWithFileSystem,
    selectedItems, setSelectedItems,
    selectItems, setSelectItems,getUniqueId
  } = useKmoContext();
  const theme = useTheme();
  const [albumSettings, setAlbumSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hideMainButtons, setHideMainButtons] = useState(false);
  const main = React.createRef<HTMLInputElement>()
  const albumName = React.createRef<HTMLInputElement>()
  //picker -> save folderDirHandle to state
  const openFolderDirHandle =async () => {
    const dirHandleVar:FileSystemDirectoryHandle = await window.showDirectoryPicker();
    setSaving(true)
    setFolder(dirHandleVar)
  }
  //create kmo_db.json -> save dbFileHandle to state
  const getDbHandle = async (folder:FileSystemDirectoryHandle) => {
    folder.getFileHandle('cache.json', { create: true })
    .then(fileHandle => {
      fileHandle.getFile().then(file => file.text()).then(fileText => {
        let text = JSON.parse(fileText || "[]")
        for (var key in text) {
          text[key][0] = null
        }
        setCache(text)
        setCacheHandle(fileHandle)
      });
    })
    folder.getFileHandle('db.json', { create: true })
    .then(fileHandle => {
      fileHandle.getFile().then(file => file.text()).then(fileText => {
          setDb(JSON.parse(fileText || "{}"))
          setDbHandle(fileHandle)
        });
    })
  }

  useEffect(() => {
    if(folder.name) getDbHandle(folder)
    return;
  }, [folder.name, setDb, setDbHandle])
  /**
   * onchange of dbFileHandle 
   * -> add kmo configuration block: 
   * config: {tags:{age:"",people:"",type:"",[new values in future]}} 
   * -> loop folderDirHandle.values() recursively 
   * -> populate dbFileHandle with path:
   * {name:"",tags:{dateModified:"",...},description:""}
   */
   const init =async (dbHandle:FileSystemFileHandle) => {
    let filesData = await getFilesData(folder)
    let found; //for Refresh button
    if(Object.keys(db).length != 0) found = true;
    let database: object = {
      config:{
        name: found? db.config.name : "My Gallery",
        folderName: dbHandle.name,
        modifiedDate: + new Date(),
        tags: found? db.config.tags : [],
        albums: found? db.config.albums : [],
        activeItem: 0,
        runtime: { //this is the `runtime` temp object, no need to be saved.
          filter: {
            search: "",
            tags: [],
            order: ""
          },
          albums: [] //this is the `runtime` temp object, i.e. no need to be saved.
        }
      },
      data:{
        filesData
      }
    }
    const writable: FileSystemWritableFileStream = await dbHandle.createWritable({ keepExistingData: false });
    await writable.write(JSON.stringify(database));
    await writable.close();
    getDbHandle(folder)
  }
  useEffect(() => {
    if(dbHandle.name && db?.config?.modifiedDate === undefined){
      init(dbHandle)
    }
    return;
  }, [dbHandle.name,folder.name])
  const getFilesData = async (folder: FileSystemDirectoryHandle) => {
    let directory: string[] = [];
    let data: any[] = [];
    const folderHandler = async (folder: FileSystemDirectoryHandle) => {
      directory.push(folder.name);
      
      for await (const entry of folder.values()) {
        if (entry.kind != "directory") {
          var temp = entry.name.split('.').pop() || "";
          var formats = ["jpg", "jpeg", "png", "gif", "webp"];
          if (formats.includes(temp)) {
            const fileHandle = await folder.getFileHandle(entry.name, {});
            const file: File = await fileHandle.getFile();
            let found; //for Refresh button
            if(Object.keys(db).length != 0){
              let keyy = Object.keys(db.data.filesData).find(key => 
                db.data.filesData[key].path == directory.join('/') + '/' + entry.name
              ) || -1;
              if((keyy: any)=>0) found = db.data.filesData[keyy]
            } 
            data.push({
              path: directory.join('/') + '/' + entry.name,
              modifiedDate: file.lastModified,
              tags: found? found.tags: [],
              albums: found? found.albums: [],
              description: found? found.description: "",
              likes: found? found.likes: 0
            });
          }
        } else if (entry.kind == "directory" && entry.name != '.kmocache') {
          //.kmocache is the cache folder of KMO
          await folderHandler(entry);
        } 
      }
      setFilesFound(data.length)
      directory.pop()
    }
    await folderHandler(folder).then(()=>data)
    
    return(data);
    // return Object.assign({}, data)
  }
  useEffect(() => {
    // while (main.current?.firstChild) {
    //   main.current?.removeChild(main.current?.firstChild);
    // }
    if(db?.config?.modifiedDate != undefined && cache[0] != "unset"){
      // if(db?.config?.modifiedDate != undefined && cache[`index0`]){
      createElements(db)
      setSaving(false)
    } 
    return;
  }, [db?.config?.modifiedDate, cache])
  const createElements = async (db: Record<string, any>) => {
    setItems([])
    await new Promise(r => setTimeout(r, 0));
    setItems(db.data.filesData)
  }
  const refreshDatabase = async () => { 
    /**
     * Reanalyze the folder to find new files;
     * * Old file tags, likes, descriptions and other values will be preserved
     * * New files will be found
     * * Cache will be rebuild
     */
    setCache({"unset":true})
    const writable2: FileSystemWritableFileStream = await cacheHandle.createWritable({ keepExistingData: false });
    await writable2.write({ type: "truncate", size: 2 })
    await writable2.write(JSON.stringify([]));
    await writable2.close();
    setFilesFound(0)
    init(dbHandle)
  }
  const newAlbumStart = () => {
    console.log('new album start');
    setSelectItems(true)
    setAlbumSettings(true)
    setHideMainButtons(true)
  }
  const newAlbumSave = () => {
    let data = {
      id: getUniqueId(),
      name: albumName.current?.value,
      dateCreated: + new Date(),
      items: selectedItems
    }
    selectedItems.map((value,key)=>{
      db.data.filesData[value[2]].albums.push(data.id)
    })
    db.config.albums.push(data)
    setDb(db)
    setSelectItems(false)
    setAlbumSettings(false)
    setHideMainButtons(false)
  }
  const cancelNewAlbumStart = () => {
    console.log('cancel new album start');
    setSelectItems(false)
    setAlbumSettings(false)
    setHideMainButtons(false)
  }
  const showFiltersSection = () => {
    setShowFilters(true)
    setHideMainButtons(true)
  }
  const hideFiltersSection = () => {
    setShowFilters(false)
    setHideMainButtons(false)
  }
  const manageAlbumEntry = (value:any, key:number) => {
    /**
     * Return values
     * 0 not an album
     * 1 is an album
     * 2 already rendered album (hide this item)
     */
    if(value.albums.length>0){
      for (let id of value.albums) {
        if(!db.config.runtime.albums.includes(id)){
          db.config.runtime.albums[key] = id
          return 1
        }else if(db.config.runtime.albums[key] == id){
          return 1
        }else if(db.config.runtime.albums.includes(id)){
          console.log(db.config.runtime.albums.indexOf(id), 'indexof');
          if(db.config.runtime.albums.indexOf(id) != key){
            return 2;
          }
        }
      }
    }
    return 0;
  }
  return (<>
      <Container>
      {db.config&&
      <>
        <Typography variant="h2" pt={3} >{db?.config?.name}</Typography>
        <Typography gutterBottom>
          Last refreshed: &nbsp; 
          <code>
            {(new Date(db?.config?.modifiedDate || 1))
            .toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")}
          </code>
        </Typography>
      </>
      }
{/* <code><pre>{JSON.stringify(items,null,2)}</pre></code> */}
      {/* <Grid container>
        {db?.config?.tags?.map((item: any,key: any)=>(
          <Grid item key={key}>
            <code><pre>{JSON.stringify(item,null,2)}</pre></code>
          </Grid>
        ))}
      </Grid> */}
      </Container>
      <ButtonBar>
      <Stack spacing={2} sx={{paddingBlock:3, alignItems: "center"}} direction="row">
      {(db.config)? null:
        <Button variant="contained" onClick={openFolderDirHandle} startIcon={<MdOutlineFolderOpen />}>Set Folder</Button>
      }
      {db.config && !hideMainButtons && 
      <>
        <Button variant="contained" onClick={refreshDatabase} startIcon={<MdRefresh />}>
          {filesFound != 0? "Analyzed "+filesFound:"Refresh"}
        </Button>
        <Button variant="contained" onClick={()=>setAddTagsModal(!addTagsModal)} startIcon={<MdTag />}>Tag Settings</Button>
        <Button variant="contained" onClick={syncWithFileSystem} startIcon={<MdOutlineSync />}>Sync with filesystem</Button>
        <Button variant="contained" onClick={newAlbumStart} startIcon={<IoAlbumsOutline />}> New Album</Button>
        <Button variant="contained" onClick={showFiltersSection} startIcon={<IoFilterSharp />}> Filter</Button>
      </>
      }
      {showFilters &&
        <>
        <Grid container spacing={2}>
          {db?.config?.tags?.map((tag:Tag, index:number)=>(
              <Grid item xs={4} key={index}>
                <Autocomplete size="small" fullWidth disablePortal multiple
                  renderInput={(params) => <TextField {...params} label={tag.name} />}
                  options={tag.values.map((item:any)=>item.name)}
                  onChange={(event, newValue: string[])=>{
                    // updateValue(newValue,index)
                  }}
                  key={index}
                  freeSolo
                  />
              </Grid>
            ))}
            <Grid item xs={4}>
              <TextField fullWidth size="small" label="Search" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <ToggleButtonGroup
                color="primary"
                exclusive sx={{height:"44px"}}
              >
                <ToggleButton value="asc">
                  <AiOutlineSortAscending size={20} style={{marginRight:"7px"}} />ASC
                </ToggleButton>
                <ToggleButton value="desc">
                  <AiOutlineSortDescending size={20} style={{marginRight:"7px"}} />DESC
                </ToggleButton>
                <ToggleButton value="rand">
                  <IoIosShuffle size={20} style={{marginRight:"7px"}} />RAND
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Button variant="contained" onClick={newAlbumStart} startIcon={<IoIosSearch />}> Search</Button>
          <Button onClick={hideFiltersSection} startIcon={<IoCloseOutline />}> Cancel</Button>
        </>
        }
      {albumSettings && 
      <>
        <TextField size="small" label="Album Name" inputRef={albumName}></TextField>
        {JSON.stringify(selectedItems)}
        <Button variant="contained" onClick={newAlbumSave} startIcon={<BsCheck2 />}> Create Album</Button>
        <Button onClick={cancelNewAlbumStart} startIcon={<IoCloseOutline />}> Cancel</Button>
      </>}
      </Stack>
      </ButtonBar>
      <Container>
      {addTagsModal&& <AddTagsModal open={addTagsModal} setOpen={setAddTagsModal}/>}
      <ImageViewer open={viewer} db={db} items={items} file={file} createElements={createElements}/>
      <div ref={main} className="imageItemWrapper" style={{marginBottom:"100px"}}>
      {items.map((value:any,key:any) => {
        let albumData = manageAlbumEntry(value, key)
        if(albumData == 2) return;
        return(
        <div key = {key} className = "imageItem">
          <ImageElement 
            path = {value.path} 
            file = {key} 
            description = {value.description}
            modifieddate = {value.tags.modifiedDate}
            onClick = {()=>{if(selectItems==false){setViewer(true);setFile(key);}}}
            album={albumData}
            selectedItems={selectedItems} setSelectedItems={setSelectedItems}
            selectItems={selectItems}
           />
        </div>
      )})}
      </div>
  </Container>
  <Popover 
  open={false}
  anchorOrigin={{
    vertical: 'center',
    horizontal: 'center',
  }}
  transformOrigin={{
    vertical: 'center',
    horizontal: 'center',
  }}
>
  The content of the Popover.
</Popover>
  </>)
}

export default Main


const ButtonBar = styled(Container)(({ theme }) => (`
  background:linear-gradient(${theme.palette.background.paper},transparent);
  backdrop-filter:blur(10px);
  position: sticky;
  top:-5px;
  z-index:3;
  margin-bottom:10px;
`))
