import { useState, useRef, useEffect, SetStateAction } from 'react';
import { useKmoContext } from './context';
import Image from "next/image"

export const ImageElement = (imageProps:any) => {
  const { folder, setFolder,getFileRecursively } = useKmoContext();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [src, setSrc] = useState("");
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (!shouldLoad && placeholderRef.current) {
      const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
          let path = imageProps['data-path'].split('/')
          path.shift()
          getFileRecursively(path, folder, imageProps['data-file'])
          .then((r: any[])=>{
            setSrc(r[0])
            setShouldLoad(true)
          })
        }
      });
      observer.observe(placeholderRef.current);
      return () => observer.disconnect();
    }
  }, [shouldLoad, placeholderRef, folder, getFileRecursively, imageProps]);

  

  return (shouldLoad 
    ? <img src={src} {...imageProps} alt="" className='image-item-image' width="800px"
    height="456.8px"/> 
    : <div className="img-placeholder" ref={placeholderRef}/>
  );
};