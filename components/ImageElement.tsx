import { useState, useRef, useEffect, SetStateAction } from 'react';
import { useKmoContext } from './context';

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
          getFileRecursively(path, folder)
          .then((r: SetStateAction<string>)=>{
            setSrc(r)
            setShouldLoad(true)
          })
        }
      });
      observer.observe(placeholderRef.current);
      return () => observer.disconnect();
    }
  }, [shouldLoad, placeholderRef]);

  

  return (shouldLoad 
    ? <img src={src} {...imageProps}/> 
    : <div className="img-placeholder" ref={placeholderRef}/>
  );
};