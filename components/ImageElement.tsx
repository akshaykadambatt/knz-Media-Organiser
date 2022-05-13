import { useState, useRef, useEffect } from 'react';
import { useKmoContext } from './context';

export const ImageElement = (imageProps:any) => {
  const { folder, setFolder } = useKmoContext();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [src, setSrc] = useState("");
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (!shouldLoad && placeholderRef.current) {
      const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
          let path = imageProps['data-path'].split('/')
          path.shift()
          getFileRecursively(path, folder)
          
        }
      });
      observer.observe(placeholderRef.current);
      return () => observer.disconnect();
    }
  }, [shouldLoad, placeholderRef]);

  const getFileRecursively = async (path: string[], folderToLookIn: FileSystemDirectoryHandle) => {
    let dir:string = path.shift() || "";
    console.log(dir);
    
    if(path.length == 0){
      let fileHandle = await folderToLookIn.getFileHandle(dir, {})
      const file = await fileHandle.getFile()
      console.log(URL.createObjectURL(file));
      setSrc(URL.createObjectURL(file))
      setShouldLoad(true);
    }else{
      let newFolder = await folderToLookIn.getDirectoryHandle(dir,{create: true})
      getFileRecursively(path, newFolder)
    }
    
  }

  return (shouldLoad 
    ? <img src={src} {...imageProps}/> 
    : <div className="img-placeholder" ref={placeholderRef}/>
  );
};