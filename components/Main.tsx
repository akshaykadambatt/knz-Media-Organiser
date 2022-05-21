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
import {ImageViewer} from "./ImageViewer"
import AddTagsModal from "./AddTags"

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
    cacheHandle, setCacheHandle
  } = useKmoContext();
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
    let database: object = {
      config:{
        name: "My Gallery",
        folderName: dbHandle.name,
        tags:{},
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
            setFilesFound((filesFound: number) => filesFound + 1)
            data.push({
              path: directory.join('/') + '/' + entry.name,
              tags: {
                modifiedDate: file.lastModified,
                newTag: "fdas"
              },
              description: ""
            });
          }
        } else if (entry.kind == "directory") await folderHandler(entry);
      }
      directory.pop()
    }
    await folderHandler(folder).then(()=>data)
    return Object.assign({}, data)
  }
  useEffect(() => {
    // while (main.current?.firstChild) {
    //   main.current?.removeChild(main.current?.firstChild);
    // }
    if(db?.config?.modifiedDate != undefined && cache[`index0`]){
      createElements(db)
      setSaving(false)
    } 
    return;
  }, [db?.config?.modifiedDate, cache])
  const createElements = (db: Record<string, any>) => setItems(db.data.filesData)
  const refreshDatabase = () => {
    setFilesFound(0)
    init(dbHandle)
  }

  return (<>
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
      <Stack spacing={2} pt={3} direction="row">
      <Button variant="contained" onClick={openFolderDirHandle}>Set Folder</Button>
      {db.config&& 
      <>
        <Button variant="contained" onClick={refreshDatabase}>
          {filesFound != 0? "Analyzed "+filesFound:"Refresh"}
        </Button>
        <Button variant="contained" onClick={()=>setAddTagsModal(!addTagsModal)}>Tag Settings</Button>
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
      </Stack>
      {addTagsModal&& <AddTagsModal open={addTagsModal} setOpen={setAddTagsModal}/>}
      <br></br>
      <ImageViewer open={viewer} file={file}/>
      <br></br>
      <div ref={main} className="imageItemWrapper">
      {Object.entries(items).map(([key, value]: any) => (
        <div key = {key} className = "imageItem">
          <ImageElement 
          data-path = {value.path} 
          data-file = {key} 
          data-description = {value.description}
          data-modifieddate = {value.tags.modifiedDate}
          onClick = {()=>{setViewer(true);setFile(key);}}
           />
        </div>
      ))}
      </div>
  </>)
}

export default Main
