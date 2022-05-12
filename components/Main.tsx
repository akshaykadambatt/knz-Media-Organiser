import React, {useEffect} from "react";
import { useKmoContext } from './context';

declare global {
    interface Window {
        showDirectoryPicker:any;
        showSaveFilePicker:any;
    }
}

const Main = () => {
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
    const getDbHandle = async (folder:FileSystemDirectoryHandle) => {
      folder.getFileHandle('db.json', { create: true })
      .then(fileHandle => {
        setDbHandle(fileHandle)
        fileHandle.getFile().then(file => file.text()).then(fileText => setDb(fileText));
      })
    } 
    if(folder.name) getDbHandle(folder)
  
    return;
  }, [folder,setDb,setDbHandle])
  /**
   * onchange of dbFileHandle 
   * -> add kmo configuration block: 
   * config: {tags:{age:"",people:"",type:"",[new values in future]}} 
   * -> loop folderDirHandle.values() recursively 
   * -> populate dbFileHandle with path:
   * {name:"",tags:{dateModified:"",...},description:""}
   */
  useEffect(() => {
    const init =async (dbHandle:FileSystemFileHandle) => {
      let config: object = {
        name: "My Gallery",
        folderName: dbHandle.name,
        tags:{}
      }
      let filesData = await getFilesData(folder)
      const writable: FileSystemWritableFileStream = await dbHandle.createWritable({ keepExistingData: true });
      await writable.write(JSON.stringify(config));
      await writable.write(JSON.stringify(filesData));
      await writable.close();
    }
    if(dbHandle.name) init(dbHandle)

    return;
  }, [dbHandle,folder])

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
            let img = document.createElement('img');
            img.src = URL.createObjectURL(file)
            img.classList.add('main-img')
            img.setAttribute('data-path', folder.name + '/' + entry.name)
            // main.current!.appendChild(img)
            // console.log(directory.join('/') + '/' + entry.name);
            // console.log((directory.join('/') + '/' + entry.name).split('/'));
            setFilesFound((filesFound: number) => filesFound + 1)
            data.push({
              path: directory.join('/') + '/' + entry.name,
              tags: {
                modifiedDate: file.lastModified
              },
              description: ""
            });
          }
        } else if (entry.kind == "directory") await folderHandler(entry);
      }
      directory.pop()
    }
    await folderHandler(folder).then(()=>data)

    return data
  }
  
  setInterval(()=>{
    // setFilesFound(filesFound+1)

    // console.log((folder.name));
    // console.log(Object.keys(folder).length === 0);
    
    // console.log(folder);
    // console.log(dbHandle);
    // console.log(db);
  },20)
    // const [dirHandle, setDirHandle] = React.useState<any>();
    // const [db, setDB] = React.useState<any>();
    const main = React.createRef<HTMLInputElement>()
    // const funfun = async () => {
    //     const dirHandleVar = await window.showDirectoryPicker();
    //     await dirHandler(dirHandleVar);
    //     await setDirHandle(dirHandleVar)
    //     setFolder(dirHandleVar)
    //   }
    // useEffect(() => {
    //     if(dirHandle){
    //         dirHandle.getFileHandle('db.json', { create: true })
    //         .then((r2:any)=>{
    //             r2.getFile()
    //             .then((file:any)=>file.text())
    //             .then((r2:any)=>{
    //                 setDb(r2)
    //             });
    //         })
    //     }
    // }, [dirHandle])
    // useEffect(() => {
    //   if(db && db!=""){
    //     console.log(db);
                
    //   }
    //   console.log('folder')
    //   console.log(folder)
    // }, [db,folder])
    let directory: any = [];
    
      // async function getNewFileHandle() {
      //   const options = {
      //       suggestedName: 'db.json',
      //     types: [
      //       {
      //         description: 'JSON File',
      //         accept: {
      //           'text/plain': ['.json'],
      //         },
      //       },
      //     ],
      //   };
      //   const handle = await window.showSaveFilePicker(options);
      //   return handle;
      // }
    return (<>
        <button onClick={openFolderDirHandle}>click</button>
        {/* <button onClick={getNewFileHandle}>click</button> */}
        {JSON.stringify(db)}
        {filesFound}
        <div ref={main}></div>
    </>)
}

export default Main
