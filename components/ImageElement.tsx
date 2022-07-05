import { useState, useRef, useEffect, SetStateAction } from 'react';
import { useKmoContext } from './context';
import Image from "next/image"
import { Box } from '@mui/material';
import { alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BsCheck2 } from "react-icons/bs";

export const ImageElement = (imageProps:any) => {
  const { folder, setFolder,getFileRecursively } = useKmoContext();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [checked, setChecked] = useState(false);
  const [src, setSrc] = useState("");
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (!shouldLoad && placeholderRef.current) {
      const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
          let path = imageProps.path.split('/')
          path.shift()
          getFileRecursively(path, folder, imageProps.file)
          .then((r: any[])=>{
            setSrc(r[1])
            setShouldLoad(true)
          })
        }
      });
      observer.observe(placeholderRef.current);
      return () => observer.disconnect();
    }
  }, [shouldLoad, placeholderRef, folder, getFileRecursively, imageProps.path]);
  useEffect(() => {
    if(imageProps.selectItems == false) setChecked(false)
    return;
  }, [imageProps.selectItems]);
  const checkItem = () => {
    if(imageProps.selectItems == false) return;
    setChecked(!checked)
    console.log(checked);
    
  }
  return (shouldLoad? 
    <div onClick={checkItem}  style={{height:"100%", width:"100px"}}>
      <div className={`checker-wrapper ${checked? "checked-image-item":""}`}><BsCheck2 /></div>
      <div className={`album-wrapper ${checked? "checked-album-wrapper":""}`} style={{height:"100%"}}>
        <img src={src}
        data-path = {imageProps.path} 
        data-file = {imageProps.file} 
        data-description = {imageProps.description}
        data-modifieddate = {imageProps.modifieddate}
        onClick={imageProps.onClick}
        alt="" 
        className={`image-item-image ${imageProps.album? 'album-image-item':null}`} 
        width="800px"
        height="456.8px"/>
        {imageProps.album? <><AlbumOne>s</AlbumOne><AlbumTwo>a</AlbumTwo></>:null}
      </div>
      
    </div>
    : <div className="img-placeholder" ref={placeholderRef}/>
  );
};

const AlbumOne = styled(Box)(({ theme }) => (`
  position: relative;
  height: 90%;
  width: 100%;
  top:-91%;
  background: ${theme.palette.mode=="light"? "#6c6c6c":"#626262"};
  z-index: -1;
  border-radius: 5px;
  transform-origin:center top;
  transform: scale(.9);
`))
const AlbumTwo = styled(Box)(({ theme }) => (`
  position: relative;
  height: 90%;
  width: 100%;
  top:-187%;
  background: ${theme.palette.mode=="light"? "#a3a3a3":"#464545"};
  z-index: -2;
  border-radius: 8px;
  transform: scale(.7);
  transform-origin:center top;
`))