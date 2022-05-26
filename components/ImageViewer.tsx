import Box from '@mui/material/Box';
import { useState, useRef, useEffect, SetStateAction, createRef, HTMLInputTypeAttribute } from 'react';
import ReactDOM from 'react-dom';
import { useKmoContext } from './context';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { BsHeart } from "react-icons/bs";
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { alpha, Autocomplete, Card, fabClasses } from '@mui/material';
import { useTheme } from '@mui/material';

export const ImageViewer = (imageProps:any) => {
  const { 
    folder, setFolder, 
    getFileRecursively, 
    viewer, setViewer, 
    db, setDb,
    file, setFile
  } = useKmoContext();
  const theme = useTheme();
  const [sidebar, setSidebar] = useState(false);
  const [src, setSrc] = useState("");
  const [prevSrc, setPrevSrc] = useState("");
  const [nextSrc, setNextSrc] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [currentTags, setCurrentTags] = useState({});
  const [alignSidebarToRight, setAlignSidebarToRight] = useState(false);
  const [likes, setLikes] = useState(0);
  const NavigationLeftElem = createRef<HTMLButtonElement>()
  const NavigationRightElem = createRef<HTMLButtonElement>()
  const focusRef = createRef<HTMLDivElement>()
  useEffect(() => {
    if(viewer){
      focusRef.current?.focus()
      let filesData = db.data.filesData[file]
      setTags(db.config.tags)

      let path = filesData.path.split('/')
      path.shift()
      getFileRecursively(path, folder, file, true)
      .then((r: any[])=>{
        setSrc(r[0])
        setDescription(filesData.description);
        console.log("filesdata likes = ", filesData.likes);
        
        setLikes(filesData.likes)
      })
      if(+file != 0){
        let path = db.data.filesData[+file-1].path.split('/')
        path.shift()
        getFileRecursively(path, folder, +file-1)
        .then((r: any[])=>{
          setPrevSrc(r[1])
        })
      } 
      if(+file < (Object.entries(db.data.filesData).length-1)){
        let path = db.data.filesData[+file+1].path.split('/')
        path.shift()
        getFileRecursively(path, folder, +file+1)
        .then((r: any[])=>{
          setNextSrc(r[1])
        })
      }
    }
  }, [viewer, file]);
  const saveTags = async (event: any) => {
    await setCurrentTags(event)
    db.data.filesData[file].tags = currentTags
  }
  const close = () => {
    setViewer(false)
    setSrc("")
  }
  const toggleSidebar = () => setSidebar(!sidebar)
  const prevItem = () => {
    if(+file != 0)setFile(+file-1)
    
  }
  const nextItem = () => {
    if(+file < (Object.entries(db.data.filesData).length-1)) setFile(+file+1)
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
  const zoomStarted = (event:any)=>{
    if(event.state.scale!=1){ setAlignSidebarToRight(true) }
    else{ setAlignSidebarToRight(false) }
  }
  const likeImage = async () => {
    await setLikes((likes: number) => likes + 1)
    db.data.filesData[file].likes = likes;
  }
  return (viewer 
    ? <Card className="image-viewer" ref={focusRef} onKeyDown={keyDownHandler} tabIndex={0}
    sx={{
      background:`linear-gradient(0deg, ${theme.palette.background.default}, ${alpha(theme.palette.background.default,.841)})`
    }}
    >
      <TopBar direction="row" justifyContent="space-between" spacing={1} p={3}>
        <Stack direction="row" spacing={1}>
          <Chip label="Close" onClick={close} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip icon={<BsHeart size={13} style={{marginLeft:"9px"}}/>} label="Like" onClick={likeImage} />
          <Chip label="Open Sidebar" onClick={toggleSidebar}  />
          <Chip label="Close" onClick={close} />
        </Stack>
        </TopBar>
        <Grid container spacing={2} sx={{flexDirection: "row",flexWrap: "nowrap",alignItems: "center"}}>
          <Grid item xs={12} sx={{transition: "all cubic-bezier(0.81, 0.07, 0.05, 1.04)  0.9s",overflow:"hidden"}}>
            <ImageViewerWrapper className="image-viewer-image-holder">
            <TransformWrapper onZoom={zoomStarted} onPanning={zoomStarted}>
              <TransformComponent>
                <img className="image-viewer-image" src={src} {...imageProps}/>
              </TransformComponent>
            </TransformWrapper>
              <Sidebar sx={{
                width:sidebar?"28vw":0,
                padding:sidebar?"10px":0,
                position: alignSidebarToRight? "absolute":"static",
                right:0,
                }} >
                <SidebarContent 
                  sidebar={sidebar} 
                  description={description} 
                  saveDescription={saveDescription}
                  tags={tags}
                  setTags={setTags}
                  currentTags={currentTags}
                  setCurrentTags={saveTags}
                  likes={likes}
                  setLikes={setLikes}
                  />
              </Sidebar>
            </ImageViewerWrapper>
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
      </Card>
    : null
  );
};

const TopBar = styled(Stack)(({ theme }) => (`
  position: fixed;
  top:0;
  width: inherit;
  transition: all .3s;
  z-index: 9;
  opacity: 0.3;
  transform: translatey(-20px);
  transition-delay: .5s;
  background: transparent;
  backdrop-filter:blur(10px);
  :hover{
    background: ${alpha(theme.palette.background.default,0.5)};
    transform: translatey(0px);
    transition-delay: 0s;
    opacity: 1;
  }
`));
const BottomBar = styled(Box)(({ theme }) => (`
  position: fixed;
  padding-left:3em;
  padding-right:4em;
  bottom:0;
  width: inherit;
  background: linear-gradient(0deg, ${theme.palette.background.default}, transparent );
  transition: all .3s;
  display: flex;
  justify-content: space-between;
  opacity: 0.3;
  transform: translatey(70px);
  transition-delay: .5s;
  :hover{
    transform: translatey(0px);
    transition-delay: 0s;
    opacity: 1;
  }
`))

const NextImage = styled(Button)(`
  height:80px;
  width:80px;
  transition: all .3s;
  opacity: .7;
  align-items: flex-end;
  :hover{
    opacity: 1;
  }
`)
const ImageViewerWrapper = styled(Box)(`
display: flex;
height: inherit;
justify-content: center;
align-items: center;
`)

const Sidebar = styled(Card)(`
  transition: width cubic-bezier(0.81, 0.07, 0.05, 1.04) 0.9s,
    padding cubic-bezier(0.81, 0.07, 0.05, 1.04) 0.9s;
  overflow-y:scroll;
  overflow-x:hidden;
  max-height: 80vh;
  position: relative;
  z-index: 0;
  border-radius: 20px;
  resize: vertical;
  ::-webkit-scrollbar {
    width: 0px;
    background-color: #F5F5F5;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 3px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #555;
  }
`);

export const SidebarContent = (data:any) => {
  const theme = useTheme();
  const descriptionRef = createRef<HTMLTextAreaElement>()
  useEffect(() => {
    descriptionRef.current!.style.height = "0px";
    const scrollHeight = descriptionRef.current!.scrollHeight;
    descriptionRef.current!.style.height = scrollHeight + "px";
  }, [data.description]);
  const updateValue = (newInputValue:any, key:any) => {
    console.log(newInputValue);
    
    data.currentTags[key] = newInputValue
    data.setCurrentTags(data.currentTags)
  }
  const handleLikes = (event:any) => {
    data.setLikes(+event.target.value)
  }
  return(
    <>
      <Box pt={2} className="image-viewer-sidebar" sx={{
        width: "26vw !important",
        color: theme.palette.text.primary,
        opacity:data.sidebar?1:0,
        transform: data.sidebar?"translateY(0px)":"translateY(40px)",
        transition: data.sidebar?"all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s .3s":
        "all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s"
        }}>
          <Stack spacing={2} pb={5}>
            <Description aria-label="empty textarea" placeholder="Description"
          value={data.description} ref={descriptionRef} onChange={data.saveDescription}
        />
        <TextField type="number" label="Likes" value={data.likes} onChange={handleLikes} inputProps={{ min: 0 }}></TextField>
        {Object.keys(data.tags).map((key, i)=>(
          <div key={key}><>
            <Autocomplete fullWidth disablePortal multiple
            sx={{ input: { color: 'red' } }}
              renderInput={(params) => <TextField {...params} label={Object.keys(data.tags[i])[0]} />}
              options={['The Godfather', 'Pulp Fiction']}
              onChange={(event, newValue: string[])=>updateValue(newValue,Object.keys(data.tags[i])[0])}
              />
          </></div>
        ))}
          </Stack>
        
      </Box>
    </>
  )
}

const Description = styled("textarea")(({ theme }) => ({
  width: "100%", 
  fontFamily:"inherit", 
  fontSize:"24px", 
  backgroundColor: "transparent",
  border:"none", 
  borderRadius: "5px",
  transition: "all .1s",
  outline:"none", 
  color:"inherit",
  overflow:"hidden",
  padding: 13,
  paddingBottom: 20,
  marginBottom: 13,
  maxWidth:"100%",
  "&:focus": {
    border:"none", 
  }
}))