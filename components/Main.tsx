import React, {useEffect,useState} from "react";
import { useKmoContext } from './context';
import {ImageElement} from './ImageElement';

declare global {
    interface Window {
        showDirectoryPicker:any;
        showSaveFilePicker:any;
    }
}

const Main = () => {
  const [items, setItems] = useState({});
  const { folder, setFolder } = useKmoContext();
  const { dbHandle, setDbHandle } = useKmoContext();
  const { db, setDb } = useKmoContext();
  const { filesFound, setFilesFound } = useKmoContext();
  //picker -> save folderDirHandle to state
  const openFolderDirHandle =async () => {
    const dirHandleVar:FileSystemDirectoryHandle = await window.showDirectoryPicker();
    setFolder(dirHandleVar)
  }
  //create kmo_db.json -> save dbFileHandle to state
  useEffect(() => {
    if(folder.name) getDbHandle(folder)
    return;
  }, [folder,setDb,setDbHandle])
  const getDbHandle = async (folder:FileSystemDirectoryHandle) => {
    folder.getFileHandle('db.json', { create: true })
    .then(fileHandle => {
      fileHandle.getFile().then(file => file.text()).then(fileText => {
          setDb(fileText)
          setDbHandle(fileHandle)
        });
    })
  } 
  /**
   * onchange of dbFileHandle 
   * -> add kmo configuration block: 
   * config: {tags:{age:"",people:"",type:"",[new values in future]}} 
   * -> loop folderDirHandle.values() recursively 
   * -> populate dbFileHandle with path:
   * {name:"",tags:{dateModified:"",...},description:""}
   */
  useEffect(() => {
    if(dbHandle.name && JSON.parse(db || "{}")?.config?.modifiedDate === undefined) init(dbHandle)
    return;
  }, [dbHandle,folder])
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
    const writable: FileSystemWritableFileStream = await dbHandle.createWritable({ keepExistingData: true });
    await writable.write(JSON.stringify(database));
    await writable.close();
    getDbHandle(folder)
  }
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
    if(db) createElements(db)
    return;
  }, [db])
  const createElements = (db: string) => {
    let data = JSON.parse(db);
    setItems(data.data.filesData)
    for (let key in data.data.filesData) {
      let item = data.data.filesData[key]
    }
    return;
  }
  const main = React.createRef<HTMLInputElement>()
  const refreshDatabase = () => {
  }

  return (<>
      <button onClick={openFolderDirHandle}>open folder</button>
      <button onClick={refreshDatabase}>refresh</button>
      {filesFound}
      <div ref={main} className="imageItemWrapper">
      {Object.entries(items).map(([key, value]: any) => (
        <div key={key} className="imageItem">
          <ImageElement 
          data-path={value.path} 
          data-description={value.description}
          data-modifiedDate={value.tags.modifiedDate}
           />
        </div>
      ))}
      </div>
  </>)
}

export default Main
