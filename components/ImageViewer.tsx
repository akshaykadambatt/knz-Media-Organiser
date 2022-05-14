import Box from '@mui/material/Box';
import { useState, useRef, useEffect, SetStateAction } from 'react';
import { useKmoContext } from './context';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from "next/image"

export const ImageViewer = (imageProps:any) => {
  const { folder, setFolder, getFileRecursively, viewer, setViewer } = useKmoContext();
  const [sidebar, setSidebar] = useState(false);
  const [src, setSrc] = useState("");

  useEffect(() => {
    if(viewer){
      let path = imageProps.file.split('/')
      path.shift()
      getFileRecursively(path, folder)
      .then((r: SetStateAction<string>)=>{
        setSrc(r)
      })
    }
  }, [viewer, folder, getFileRecursively, imageProps]);
  const close = () => {
    setViewer(false)
    setSrc("")
  }
  const toggleSidebar = () => {
    setSidebar(!sidebar)
  }
  return (viewer 
    ? <Box color="#fff" className="image-viewer">
      <Stack className="image-viewer-top-bar" direction="row"  justifyContent="space-between" spacing={1} p={3}>
        <Stack direction="row" spacing={1}>
          <Chip label="Close" onClick={close} color="secondary"/>
          <Chip label="Edit" onClick={toggleSidebar} color="secondary" variant="outlined"/>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip label="Open Sidebar" onClick={toggleSidebar} color="secondary" variant="outlined"/>
          <Chip label="Edit" onClick={toggleSidebar} color="secondary" variant="outlined"/>
          <Chip label="Close" onClick={close} color="secondary"/>
        </Stack>
        </Stack>
        <Grid container spacing={2} sx={{flexDirection: "row",flexWrap: "nowrap"}}>
          <Grid item xs={sidebar? 9:12} sx={{transition: "all cubic-bezier(0.79, 0.32, 0.33, 0.83)  0.7s",overflow:"hidden"}}>
            <Box className="image-viewer-image-holder">
              <Image className="image-viewer-image" src={src} {...imageProps} alt=""/>
            </Box>
          </Grid>
            <Grid item xs={sidebar? 4:1}  sx={{
              transition: "all cubic-bezier(0.79, 0.32, 0.33, 0.83) 0.7s",
              overflow:"hidden",
              maxWidth: sidebar?"25vw":"0px !important",
              background: "rgb(28 28 28)",
              }}>
              <Box pt={10} className="image-viewer-sidebar" sx={{width: "25vw !important"}}>
                <Typography>
                  I&apos;m trying to make the text 100% height of a div but it doesn&apos;t work.
                  It just becomes 100% of the body Is there any way to make it follow the div height?
                  The div height is 4% of the whole page and I wan&apos;t the text to follow it when you resize/change resolution.
                </Typography>
              </Box>
            </Grid>
        </Grid>
        <Box className="sidebar-image-wrapper">
          
          
        </Box>
      </Box>
    : null
  );
};