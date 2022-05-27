import React, {useEffect,useState} from "react";
import { useKmoContext } from './context';
import {ImageElement} from './ImageElement';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CircularProgress, Container, FormControlLabel, FormGroup, Switch } from '@mui/material';
import {ImageViewer} from "./ImageViewer"
import AddTagsModal from "./AddTags"
import { Skeleton } from "@mui/material";
import { IoFilterSharp } from 'react-icons/io5';
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
}

const Main = () => {
  const [items, setItems] = useState({});
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
    syncWithFileSystem
  } = useKmoContext();
  const theme = useTheme();
  const main = React.createRef<HTMLInputElement>()
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
        let text = JSON.parse(fileText || "{}")
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
        tags: found? db.config.tags : {},
        modifiedDate: + new Date()
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
              tags: found? found.tags: {},
              description: found? found.description: "",
              likes: found? found.likes: 0
            });
          }
        } else if (entry.kind == "directory") await folderHandler(entry);
      }
      setFilesFound(data.length)
      directory.pop()
    }
    await folderHandler(folder).then(()=>data)
    return Object.assign({}, data)
  }
  useEffect(() => {
    // while (main.current?.firstChild) {
    //   main.current?.removeChild(main.current?.firstChild);
    // }
    if(db?.config?.modifiedDate != undefined && cache['unset'] == undefined){
      // if(db?.config?.modifiedDate != undefined && cache[`index0`]){
      createElements(db)
      setSaving(false)
    } 
    return;
  }, [db?.config?.modifiedDate, cache])
  const createElements = async (db: Record<string, any>) => {
    setItems({})
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
    await writable2.write(JSON.stringify({}));
    await writable2.close();
    setFilesFound(0)
    init(dbHandle)
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
      </Container>
      <ButtonBar>
      <Stack spacing={2} sx={{paddingBlock:3}} direction="row">
      <Button variant="contained" onClick={openFolderDirHandle} startIcon={<MdOutlineFolderOpen />}>Set Folder</Button>
      {db.config&& 
      <>
        <Button variant="contained" onClick={refreshDatabase} startIcon={<MdRefresh />}>
          {filesFound != 0? "Analyzed "+filesFound:"Refresh"}
        </Button>
        <Button variant="contained" onClick={()=>setAddTagsModal(!addTagsModal)} startIcon={<MdTag />}>Tag Settings</Button>
        <Button variant="contained" onClick={syncWithFileSystem} startIcon={<MdOutlineSync />}>Sync with filesystem</Button>
        <Button variant="contained" onClick={syncWithFileSystem} startIcon={<IoFilterSharp />}> Filter</Button>
        {false &&
        <>
          <TextField size="small" label="Search" variant="outlined" />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small">Age</InputLabel>
            <Select
              labelId="demo-select-small"
              id="demo-select-small"
              label="Age"
              value={10}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </>
        }
        
      </>
      }
      </Stack>
      </ButtonBar>
      <Container>
      {addTagsModal&& <AddTagsModal open={addTagsModal} setOpen={setAddTagsModal}/>}
      <ImageViewer open={viewer} file={file} createElements={createElements}/>
      <div ref={main} className="imageItemWrapper">
      {Object.entries(items).map(([key, value]: any) => (
        <div key = {key} className = "imageItem">
          <ImageElement 
          data-path = {value.path} 
          path = {value.path} 
          data-file = {key} 
          data-description = {value.description}
          data-modifieddate = {value.tags.modifiedDate}
          onClick = {()=>{setViewer(true);setFile(key);}}
           />
        </div>
      ))}
      </div>
  </Container>
  </>)
}

export default Main


const ButtonBar = styled(Container)(({ theme }) => (`
  background:linear-gradient(${theme.palette.background.paper},transparent);
  backdrop-filter:blur(10px);
  position: sticky;
  top:-5px;
`))
