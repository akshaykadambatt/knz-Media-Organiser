import Box from '@mui/material/Box';
import { useState, useRef, useEffect, SetStateAction, createRef } from 'react';
import ReactDOM from 'react-dom';
import { useKmoContext } from './context';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { AiOutlineHeart } from "react-icons/ai";
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';

export const ImageViewer = (imageProps:any) => {
  const { 
    folder, setFolder, 
    getFileRecursively, 
    viewer, setViewer, 
    db, setDb,
    file, setFile
  } = useKmoContext();
  const [sidebar, setSidebar] = useState(false);
  const [src, setSrc] = useState("");
  const [prevSrc, setPrevSrc] = useState("");
  const [nextSrc, setNextSrc] = useState("");
  const [description, setDescription] = useState("");
  const NavigationLeftElem = createRef<HTMLButtonElement>()
  const NavigationRightElem = createRef<HTMLButtonElement>()
  const descriptionRef = createRef<HTMLTextAreaElement>()
  const focusRef = createRef<HTMLDivElement>()
  useEffect(() => {
    if(viewer){
      focusRef.current?.focus()
      let filesData = db.data.filesData[file]
      let path = filesData.path.split('/')
      path.shift()
      getFileRecursively(path, folder, file)
      .then((r: any[])=>{
        setSrc(r[0])
        setDescription(filesData.description);
      })
      if(+file != 0){
        let path = db.data.filesData[+file-1].path.split('/')
        path.shift()
        getFileRecursively(path, folder, +file-1)
        .then((r: any[])=>{
          setPrevSrc(r[0])
        })
      } 
      if(+file < (Object.entries(db.data.filesData).length-1)){
        let path = db.data.filesData[+file+1].path.split('/')
        path.shift()
        getFileRecursively(path, folder, +file+1)
        .then((r: any[])=>{
          setNextSrc(r[0])
        })
      }
    }
  }, [viewer, file]);
  
  const close = () => {
    setViewer(false)
    setSrc("")
  }
  const toggleSidebar = () => setSidebar(!sidebar)
  const prevItem = () => {
    if(+file != 0){
      setFile(+file-1)
    } 
  }
  const nextItem = () => {
    if(+file < (Object.entries(db.data.filesData).length-1)){
      setFile(+file+1)
    }
  }
  const saveDescription = (event: any) => {
    setDescription(event.target.value)
    db.data.filesData[file].description = description
  }
  const keyDownHandler = (event: any) => {
    if(event.key === "ArrowLeft") NavigationLeftElem.current?.click()
    if(event.key === "ArrowRight") NavigationRightElem.current?.click()
    if(event.key === "Escape") setViewer(false)
  }
  return (viewer 
    ? <Box color="#fff" className="image-viewer" ref={focusRef} onKeyDown={keyDownHandler} tabIndex={0}>
      <TopBar direction="row" justifyContent="space-between" spacing={1} p={3}>
        <Stack direction="row" spacing={1}>
          <Chip label="Close" onClick={close} color="secondary"/>
          <Chip label="Edit" onClick={toggleSidebar} color="secondary" variant="outlined"/>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip icon={<AiOutlineHeart />} label="Like" color="secondary" variant="outlined" />
          <Chip label="Open Sidebar" onClick={toggleSidebar} color="secondary" variant="outlined"/>
          <Chip label="Edit" onClick={toggleSidebar} color="secondary" variant="outlined"/>
          <Chip label="Close" onClick={close} color="secondary"/>
        </Stack>
        </TopBar>
        <Grid container spacing={2} sx={{flexDirection: "row",flexWrap: "nowrap"}}>
          <Grid item xs={sidebar? 9:12} sx={{transition: "all cubic-bezier(0.81, 0.07, 0.05, 1.04)  0.9s",overflow:"hidden"}}>
            <Box className="image-viewer-image-holder">
              <img className="image-viewer-image" src={src} {...imageProps} alt=""/>
            </Box>
          </Grid>
            <Grid item xs={sidebar? 4:1}  sx={{
              transition: "all cubic-bezier(0.81, 0.07, 0.05, 1.04) 0.9s",
              overflow:"hidden",
              maxWidth: sidebar?"25vw":"0px !important",
              background: "rgb(28 28 28)",
              }}>
              <Box pt={10} className="image-viewer-sidebar" sx={{width: "25vw !important"}}>
              <Description aria-label="empty textarea" placeholder="Empty"
                value={description} ref={descriptionRef} onChange={saveDescription}
              />
              </Box>
            </Grid>
        </Grid>
        <BottomBar p={3}>
          <NextImage onClick={prevItem} disableRipple ref={NavigationLeftElem} >
            <img className="navigation-image" src={prevSrc} alt="" />
          </NextImage>
          <NextImage onClick={nextItem} disableRipple ref={NavigationRightElem}>
            <img className="navigation-image" src={nextSrc} alt="" />
          </NextImage>
        </BottomBar>
      </Box>
    : null
  );
};

const TopBar = styled(Stack)(`
  position: fixed;
  top:0;
  width: inherit;
  background: linear-gradient(180deg, #0000008a, #00000000);
`)

const BottomBar = styled(Box)(`
  position: fixed;
  padding-left:1em;
  padding-right:3em;
  bottom:0;
  width: inherit;
  background: linear-gradient(0deg, #0000008a, #00000000);
  display: flex;
  justify-content: space-between;
`)

const NextImage = styled(Button)(`
  height:80px;
  width:80px;
  transition: all .1s;
  opacity: .7;
  align-items: flex-end;
  :hover{
    opacity: 1;
  }
`)

const Description = styled(TextareaAutosize)({
  width: "100%", 
  fontFamily:"inherit", 
  fontSize:"inherit", 
  backgroundColor: "transparent",
  border:"none", 
  outline:"none", 
  color: "white"
})