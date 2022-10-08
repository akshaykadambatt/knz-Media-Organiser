import Box from '@mui/material/Box';
import { useState, useRef, useEffect, SetStateAction, createRef, HTMLInputTypeAttribute, ReactNode, SyntheticEvent, useId } from 'react';
import ReactDOM from 'react-dom';
import { useKmoContext } from './context';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { GrNext, GrPrevious } from "react-icons/gr";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { alpha, Autocomplete,createFilterOptions, Card, FilterOptionsState, Modal } from '@mui/material';
import { useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import React from 'react';

const filter = createFilterOptions();

export const ImageViewer = (imageProps:any) => {
  const { 
    folder, setFolder, 
    getFileRecursively, 
    viewer, setViewer, 
    cache, setCache,
    file, setFile
  } = useKmoContext();
  const db = imageProps.db
  const items = imageProps.items
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
  const [currentTags, setCurrentTags] = useState([] as any[]);
  const [alignSidebarToRight, setAlignSidebarToRight] = useState(false);
  const [likes, setLikes] = useState(0);
  const NavigationLeftElem = createRef<HTMLButtonElement>()
  const NavigationRightElem = createRef<HTMLButtonElement>()
  const ResetZoomElem = createRef<HTMLButtonElement>()
  const focusRef = createRef<HTMLDivElement>()
  useEffect(()=>{
    // console.log("prevKey",prevKey);
    // console.log("file",file, db.data?.filesData[file]?.path, db.data?.filesData);
    // console.log("nextKey",nextKey);
    if(viewer && items[prevKey]){
      let path = items[prevKey].path.split('/')
      path.shift()
      getFileRecursively(path, folder, prevKey).then((r: any[])=>setPrevSrc(r[1]))
    }else{
      setPrevSrc('')
    }
  },[prevKey])
  useEffect(()=>{
    if(viewer && items[nextKey]){
      let path = items[nextKey].path.split('/')
      path.shift()
      getFileRecursively(path, folder,nextKey).then((r: any[])=>setNextSrc(r[1]))
    }else{
      setNextSrc('')
    }
  },[nextKey])
  useEffect(() => {
    if(viewer && db.data?.filesData[file] != undefined){
      focusRef.current?.focus()
      let filesData = db.data?.filesData[file]
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
    // items[file].tags = currentTags
  }
  const close = () => {
    setViewer(false)
    setSrc("")
  }
  const toggleSidebar = () => setSidebar(!sidebar)
  const prevItem = () => {
    if(+file != 0 && prevKey != -1)setFile(prevKey)
    ResetZoomElem.current?.click()
  }
  const nextItem = () => {
    if(+file < (items.length-1) && nextKey != -1) setFile(nextKey)
    ResetZoomElem.current?.click()
  }
  const saveDescription = (event: any) => {
    setDescription(event.target.value)
    items[file].description = description
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
      items[file].likes = likes;
    }
  }, [viewer, likes]);
  const deleteFile = async () => {
      let filesData = items[file]
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
    ? <Modal open={viewer} className="image-viewer" ref={focusRef} onKeyDown={keyDownHandler} tabIndex={0}
    sx={{
      background:`linear-gradient(0deg, ${theme.palette.background.default}, ${alpha(theme.palette.background.default,.841)})`
    }}
    >
      <>
      <TopBar direction="row" justifyContent="space-between" spacing={1} px={3} pt={1.2} pb={1.2}>
        <Stack direction="row" spacing={1}>
          <Chip label="Close" onClick={close} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip 
            icon={(likes>0)? <BsHeartFill size={13} style={{marginLeft:"9px"}}/>:<BsHeart size={13} style={{marginLeft:"9px"}}/>} 
            label="Like"  color="primary"
            onClick={likeImage} 
          />
          <Chip label="Open Sidebar" color="primary" onClick={toggleSidebar}  />
          <Chip label="Delete" color="error" onClick={deleteFile} />
          <Chip label="Close" onClick={close} />
        </Stack>
        </TopBar>
        <SideNavigationsLeft onClick={prevItem}>
          <GrPrevious/>
        </SideNavigationsLeft>
        <SideNavigationsRight onClick={nextItem}>
          <GrNext/>
        </SideNavigationsRight>
        <Grid container spacing={2} sx={{flexDirection: "row",flexWrap: "nowrap",alignItems: "center"}}>
          <Grid item xs={12} sx={{transition: "all cubic-bezier(0.81, 0.07, 0.05, 1.04)  0.9s",overflow:"hidden"}}>
            <ImageViewerWrapper className="image-viewer-image-holder">
            <TransformWrapper onZoom={zoomStarted} onPanning={zoomStarted} >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <div >
                <div className="tools" style={{display:"none"}}>
                  {/* <button onClick={() => zoomIn()}>+</button>
                  <button onClick={() => zoomOut()}>-</button> */}
                  <button onClick={() => resetTransform()} ref={ResetZoomElem}>x</button>
                </div>
                <TransformComponent>
                  <img className="image-viewer-image" src={src}/>
                </TransformComponent>
              </div>
              
            )}
            </TransformWrapper>
            <Sidebar sx={{
                width:sidebar?"33.5vw":0,
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
          <SwipeableDrawer onClose={function (event: SyntheticEvent<{}, Event>): void {
          throw new Error('Function not implemented.');
        } } onOpen={function (event: SyntheticEvent<{}, Event>): void {
          throw new Error('Function not implemented.');
        } } open={false}>dsafgasd</SwipeableDrawer>
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
        </>
      </Modal>
    : null
  );
};

export const SidebarContent = ({sidebar, description, tags, currentTags, likes, setTags, saveDescription, setCurrentTags, setLikes}:any) => {
  const [render, setRender] = useState(false);
  const theme = useTheme();
  const descriptionRef = createRef<HTMLTextAreaElement>();
  const { getUniqueId } = useKmoContext();
  useEffect(() => {
    setRender(false)
    setTimeout(() => setRender(true), 10)
    console.log("tags,currentTags",tags,currentTags);
  }, [currentTags]);
  useEffect(() => {
    descriptionRef.current!.style.height = "0px";
    const scrollHeight = descriptionRef.current!.scrollHeight;
    descriptionRef.current!.style.height = scrollHeight + "px";
  }, [description]);
  const updateValue = (newInputValue:any, index:any) => {
    newInputValue.map((item:string)=>{
      let found = tags[index].values.some((el:TagItem) => el.name === item);
      if (!found) tags[index].values.push({name: item, id: getUniqueId()}) 
      setTags(tags)
      tags[index].values.map((ii:TagItem)=>{
        if(ii.name == item){
          console.log('tags',tags, currentTags, ii.id);
          currentTags.push(ii.id)
        }
      })
      console.log('tags',tags, currentTags);
      setCurrentTags(currentTags)
    })
    // currentTags[index] = newInputValue
  }
  const handleLikes = (event:any) => {
    setLikes(+event.target.value)
  }
  const getTagNameFromId = (tagId:string, itemId:string) => {
    console.log("tagssss",tags, tagId, itemId); //idbw0kk2n idiuv8x0i3e
    if(tags.length < 1) return;
    const res = tags.filter((item:Tag) => {
      return item.id == tagId
    })
    if(res.length < 1) return;
    const tagRes = res[0].values.filter((item:TagItem) => {
      return item.id == itemId
    })
    if(tagRes.length < 1) return;
    console.log('tagRes.name',tagRes[0].name);
    return tagRes[0].name;
  }

  return(
    <>
      <Box pt={2} className="image-viewer-sidebar" sx={{
        width: "32vw !important",color: theme.palette.text.primary,opacity:sidebar?1:0,
        transform: sidebar?"translateY(0px)":"translateY(40px)",
        transition: sidebar?"all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s .3s":"all cubic-bezier(0.81, 0.07, 0.05, 1.04) .7s"
        }}>
          <Stack spacing={2} pb={5}>
            <Description placeholder="Description" value={description} ref={descriptionRef} onChange={saveDescription}/>
            <TextField type="number" size="small" label="Likes" value={likes} onChange={handleLikes} inputProps={{ min: 0 }}></TextField>
            {render?tags.map((tag:Tag, index:number)=>(
              <div key={index}>
                <Autocomplete fullWidth disablePortal multiple size="small"
                  renderInput={(params) => <TextField {...params} label={tag.name} />}
                  defaultValue={currentTags.map((item:string)=>getTagNameFromId(tag.id, item)).filter((el:unknown) => el !== undefined)}
                  options={tag.values.map((item:any)=>item.name)}
                  onChange={(event, newValue: string[])=>updateValue(newValue,index)}
                  filterOptions={(options, params:FilterOptionsState<string>) => {
                    const filtered = filter(options, params as FilterOptionsState<unknown>);
                    if (params.inputValue !== '') filtered.push(`${params.inputValue.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())}`);

                    return filtered as string[];
                  }}
                  key={index}
                  freeSolo
                  />
              </div>
            ))
            :<>
              {Object.keys(tags).map((key)=>(
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
  opacity: 0.1;
  transform: translatey(-10px);
  transition-delay: .5s;
  background: transparent;
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
  z-index: 9;
  height:83px;
  background: transparent;
  transition: all .3s;
  opacity: 0.3;
  transform: translatey(30px);
  transition-delay: .5s;
  :hover{
    background: ${alpha(theme.palette.background.default,0.8)};
    transform: translatey(0px);
    transition-delay: 0s;
    opacity: 1;
  }
`))
const SideNavigations = styled(Box)(({theme}) => (`
  height:100vh;
  z-index:8;
  width:100px;
  position:absolute;
  top:0;
  cursor:pointer;
  transition: all .3s;
  display: flex;
  align-items: center;
  opacity:.3;
  background:transparent;
  :hover{
    background:${alpha(theme.palette.background.default,0.8)};
    opacity: 1;
  }
  polyline{
    stroke:#fff;
  }
  svg{
    transition: all .3s;
  }
`))
const SideNavigationsLeft = styled(SideNavigations)(({theme}) => (`
  left:0;
  transform: translateX(-50px);
  justify-content: flex-end;
  padding-right: 20px;
  :hover {
    transform: translateX(0px);
    svg{
      transform:scale(1.5) translateX(-20px);
    }
  }
`))
const SideNavigationsRight = styled(SideNavigations)(({theme}) => (`
  right:0;
  transform: translateX(50px);
  justify-content: flex-start;
  padding-left: 20px;
  :hover {
    transform: translateX(0px);
    svg{
      transform:scale(1.5) translateX(20px);
    }
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
  fontSize:"17px", 
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