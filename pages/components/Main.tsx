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
  }, [folder])
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
      let config = {
        name: "My Gallery",
        folderName: dbHandle.name,
        tags:{}
      }
      const writable = await dbHandle.createWritable();
      await writable.write(JSON.stringify(config));
      await writable.close();
    }
    if(dbHandle.name) init(dbHandle)

    return;
  }, [dbHandle])
  
setInterval(()=>{
  // console.log((folder.name));
  // console.log(Object.keys(folder).length === 0);
  
  // console.log(folder);
  // console.log(dbHandle);
  // console.log(db);
},2000)
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
    // let directory:any = [];
    //   async function dirHandler(dirHandle:any) {
    //     // console.log(await (await dirHandle.getFileHandle('119d5e5ece3b102a7aaf06e9e96ebdf6.jpg')).getFile());
    //     directory.push(dirHandle.name);
    //     for await (const entry of dirHandle.values()) {
    //       if (entry.kind != "directory") {
    //         var temp = entry.name.split('.').pop();
    //         var formats = ["jpg", "jpeg", "png", "gif", "webp"];
    //         let i=0;
    //         if (formats.includes(temp)) {
    //           const fileHandle = await dirHandle.getFileHandle(entry.name, {});
    //           const file = await fileHandle.getFile();
    //           let img = document.createElement('img');
    //           img.src = URL.createObjectURL(file)
    //           img.classList.add('main-img')
    //           img.setAttribute('data-path',dirHandle.name + '/' + entry.name)
    //           main.current!.appendChild(img)
    //     // console.log(directory.join('/') + '/' + entry.name);
    //     // console.log((directory.join('/') + '/' + entry.name).split('/'));
    //   } else {
    //         //   document.getElementById('code').innerHTML = i;i++;
    //         }
    //       } else if (entry.kind == "directory") {
    //         await dirHandler(entry);
    //       }
    //     }
    //     directory.pop(dirHandle.name)
    //   }
    //   async function getNewFileHandle() {
    //     const options = {
    //         suggestedName: 'db.json',
    //       types: [
    //         {
    //           description: 'JSON File',
    //           accept: {
    //             'text/plain': ['.json'],
    //           },
    //         },
    //       ],
    //     };
    //     const handle = await window.showSaveFilePicker(options);
    //     return handle;
    //   }
    return (
        <div>
          
        <button onClick={openFolderDirHandle}>click</button>
        {/* <button onClick={getNewFileHandle}>click</button> */}
        {JSON.stringify(db)}
        <div ref={main}></div>
        </div>
    )
}

export default Main
