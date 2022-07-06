import Box from '@mui/material/Box';
import { useState, useRef, useEffect, SetStateAction, createRef, HTMLInputTypeAttribute, ReactNode, SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import { useKmoContext } from './context';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { alpha, Autocomplete,createFilterOptions, Card, FilterOptionsState } from '@mui/material';
import { useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

const filter = createFilterOptions();

export const ImageViewer = (imageProps:any) => {
  const { 
    folder, setFolder, 
    getFileRecursively, 
    viewer, setViewer, 
    cache, setCache,
    db, setDb,
    file, setFile
  } = useKmoContext();
  const theme = useTheme();
  const [sidebar, setSidebar] = useState(false);
  const [src, setSrc] = useState("");
  const [prevSrc, setPrevSrc] = useState("");
  const [nextSrc, setNextSrc] = useState("");
  const [prevKey, setPrevKey] = useState(-1);
  const [nextKey, setNextKey] = useState(-1);
  const [updateViewer, setUpdateViewer] = useState(-1);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [currentTags, setCurrentTags] = useState({} as any);
  const [alignSidebarToRight, setAlignSidebarToRight] = useState(false);
  const [likes, setLikes] = useState(0);
  const NavigationLeftElem = createRef<HTMLButtonElement>()
  const NavigationRightElem = createRef<HTMLButtonElement>()
  const focusRef = createRef<HTMLDivElement>()
  useEffect(()=>{
    // console.log("prevKey",prevKey);
    // console.log("file",file, db.data?.filesData[file]?.path, db.data?.filesData);
    // console.log("nextKey",nextKey);
    if(viewer && db.data.filesData[prevKey]){
      let path = db.data.filesData[prevKey].path.split('/')
      path.shift()
      getFileRecursively(path, folder, prevKey).then((r: any[])=>setPrevSrc(r[1]))
    }else{
      setPrevSrc('')
    }
  },[prevKey])
  useEffect(()=>{
    if(viewer && db.data.filesData[nextKey]){
      let path = db.data.filesData[nextKey].path.split('/')
      path.shift()
      getFileRecursively(path, folder,nextKey).then((r: any[])=>setNextSrc(r[1]))
    }else{
      setNextSrc('')
    }
  },[nextKey])
  useEffect(() => {
    if(viewer && db.data?.filesData[file] != undefined){
      focusRef.current?.focus()
      let filesData = db.data.filesData[file]
      setTags(db.config.tags)
      let path = filesData.path.split('/')
      path.shift()
      getFileRecursively(path, folder, file, true)
      .then((r: any[])=>{
        setSrc(r[0])
        setDescription(filesData.description);
        setLikes(filesData.likes)
        setCurrentTags(filesData.tags)
      })
      setPrevKey(+file-1)
      setNextKey(+file+1)
    }else setViewer(false)
  }, [viewer, file, updateViewer]);
  const saveTags = async (event: any) => {
    await setCurrentTags(event)
    db.data.filesData[file].tags = currentTags
    console.log(currentTags, tags);
    Object.keys(tags).map((key, i)=>
     {
      console.log(currentTags[Object.keys(tags[i])[0]])
      console.log(tags[i][Object.keys(tags[i])[0] as string])
    }
    )
    
  }
  const close = () => {
    setViewer(false)
    setSrc("")
  }
  const toggleSidebar = () => setSidebar(!sidebar)
  const prevItem = () => {
    if(+file != 0 && prevKey != -1)setFile(prevKey)
  }
  const nextItem = () => {
    if(+file < (db.data.filesData.length-1) && nextKey != -1) setFile(nextKey)
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
    setLikes((likes: number) => likes + 1)
  }
  useEffect(() => {
    if(viewer){
      db.data.filesData[file].likes = likes;
    }
  }, [viewer, likes]);
  const deleteFile = async () => {
      let filesData = db.data.filesData[file]
      let path = filesData.path.split('/')
      path.shift()
      getFileAndDelete(path, folder)
  }
  const getFileAndDelete: any = async (path: string[], folderToLookIn: FileSystemDirectoryHandle) => {
    let dir:string = path.shift() || "";
    if(path.length == 0){
      await folderToLookIn.removeEntry(dir);
      db.data.filesData.splice(file, 1);
      cache.splice(file, 1);
      setCache(cache)
      imageProps.createElements(db)
      setUpdateViewer((updateViewer) => updateViewer + 1)
      return;
    }else{
      let newFolder = await folderToLookIn.getDirectoryHandle(dir,{create: true})
      return getFileAndDelete(path, newFolder)
    }
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
          <Chip 
            icon={(likes>0)? <BsHeartFill size={13} style={{marginLeft:"9px"}}/>:<BsHeart size={13} style={{marginLeft:"9px"}}/>} 
            label="Like" 
            onClick={likeImage} 
          />
          <Chip label="Open Sidebar" onClick={toggleSidebar}  />
          <Chip label="Delete" onClick={deleteFile} />
          <Chip label="Close" onClick={close} />
        </Stack>
        </TopBar>
        <Grid container spacing={2} sx={{flexDirection: "row",flexWrap: "nowrap",alignItems: "center"}}>
          <Grid item xs={12} sx={{transition: "all cubic-bezier(0.81, 0.07, 0.05, 1.04)  0.9s",overflow:"hidden"}}>
            <ImageViewerWrapper className="image-viewer-image-holder">
            <TransformWrapper onZoom={zoomStarted} onPanning={zoomStarted}>
              <TransformComponent>
                <img className="image-viewer-image" src={src}/>
              </TransformComponent>
            </TransformWrapper>
            <Sidebar sx={{
                width:sidebar?"28vw":0,
                padding:sidebar?"10px":0,
                position: alignSidebarToRight? "absolute":"static",
                right:0,
                }} key={file}>
                <SidebarContent 
                  sidebar={sidebar} 
                  description={description} 
                  tags={tags}
                  currentTags={currentTags}
                  likes={likes}
                  setTags={setTags}
                  saveDescription={saveDescription}
                  setCurrentTags={saveTags}
                  setLikes={setLikes}
                  />
              </Sidebar>
            </ImageViewerWrapper>
          </Grid>
        </Grid>
        <BottomBar p={3}>
          {prevSrc && 
          <PrevImage onClick={prevItem} disableRipple ref={NavigationLeftElem} >
            <IoIosArrowBack size={70} style={{color:alpha(theme.palette.text.primary,.7)}}/>
            <img className="navigation-image" src={prevSrc} alt="" />
          </PrevImage>
          }
          <Typography>{db?.data.filesData[file]?.path}</Typography>
          {nextSrc &&
          <NextImage onClick={nextItem} disableRipple ref={NavigationRightElem}>
            <img className="navigation-image" src={nextSrc} alt="" />
            <IoIosArrowForward size={70} style={{color:alpha(theme.palette.text.primary,.7)}}/>
          </NextImage>
          }
        </BottomBar>
      </Card>
    : null
  );
};

export const SidebarContent = (data:any) => {
  const [render, setRender] = useState(false);
  const theme = useTheme();
  const descriptionRef = createRef<HTMLTextAreaElement>()
  useEffect(() => {
    setRender(false)
    setTimeout(() => setRender(true), 10)
  }, [data.currentTags]);
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
      <Box pt={2} key={data.key} className="image-viewer-sidebar" sx={{
        width: "26vw !important",color: theme.palette.text.primary,opacity:data.sidebar?1:0,
        transform: data.sidebar?"translateY(0px)":"translateY(40px)",
        transition: data.sidebar?"all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s .3s":"all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s"
        }}>
          <Stack spacing={2} pb={5}>
            <Description placeholder="Description" value={data.description} ref={descriptionRef} onChange={data.saveDescription}/>
            <TextField type="number" label="Likes" value={data.likes} onChange={handleLikes} inputProps={{ min: 0 }}></TextField>
            {render?Object.keys(data.tags).map((key, i)=>(
              <div key={key}><>
                <Autocomplete fullWidth disablePortal multiple
                  renderInput={(params) => <TextField {...params} label={Object.keys(data.tags[i])[0]} />}
                  defaultValue={data.currentTags[Object.keys(data.tags[i])[0]]}
                  options={['The Godfather', 'Pulp Fiction']}
                  onChange={(event, newValue: string[])=>updateValue(newValue,Object.keys(data.tags[i])[0])}
                  filterOptions={(options, params:FilterOptionsState<string>) => {
                    const filtered = filter(options, params as FilterOptionsState<unknown>);
                    if (params.inputValue !== '') filtered.push(`${params.inputValue.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())}`);

                    return filtered as string[];
                  }}
                  key={key+data.key}
                  freeSolo
                  />
              </></div>
            ))
            :<>
              {Object.keys(data.tags).map((key)=>(
                <Skeleton variant="rectangular" key={key+"skeleton"} width={360} height={58} animation="wave" />
              ))}
            </>}
          </Stack>
      </Box>
    </>
  )
}

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
    background: ${alpha(theme.palette.background.default,0.8)};
    transform: translatey(0px);
    transition-delay: 0s;
    opacity: 1;
  }
`));
const BottomBar = styled(Box)(({ theme }) => (`
  position: fixed;
  text-align:center;
  bottom:0;
  width: inherit;
  height:83px;
  background: transparent;
  transition: all .3s;
  opacity: 0.3;
  transform: translatey(30px);
  backdrop-filter:blur(10px);
  transition-delay: .5s;
  :hover{
    background: ${alpha(theme.palette.background.default,0.8)};
    transform: translatey(0px);
    transition-delay: 0s;
    opacity: 1;
  }
`))

const NextImage = styled(Button)(`
  height:60px;
  width:80px;
  position: absolute;
  bottom:12px;
  right:33px;
  transition: all .3s;
  opacity: 1;
  align-items:center;
  :hover{
    width:140px;
    background: transparent;
  }
`)
const PrevImage = styled(Button)(`
  height:60px;
  width:80px;
  position: absolute;
  bottom:12px;
  left:19px;
  transition: all .4s;
  opacity: 1;
  align-items:center;
  :hover{
    background: transparent;
    width:140px;
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