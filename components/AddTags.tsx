import { useState, useRef, useEffect, SetStateAction, createRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useKmoContext } from './context';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "70vw",
  bgcolor: 'background.paper',
  borderRadius: '6px',
  boxShadow: 24,
  p: 4,
};

export default function AddTagsModal({open, setOpen}:any) {
  const handleClose = () => setOpen(false);
  const { 
    folder, setFolder, 
    getFileRecursively, 
    viewer, setViewer, 
    db, setDb,
    file, setFile
  } = useKmoContext();
  const [sidebar, setSidebar] = useState(false);
  console.log(db.config.tags);
  
  return (
    <div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h2" component="h2">
            Add new tags
          </Typography>
          <Typography sx={{ mt: 2 }} gutterBottom>
            Add new tags to help yourself organize the images.
          </Typography>
          <Entry />
          <Entry />
          <Button variant="contained" sx={{marginTop: 2}}>Add New Tag</Button>
        </Box>
      </Modal>
    </div>
  );
}

const Entry = () => {
    return (
      <>
        <Grid container spacing={3} sx={{paddingTop: 2}}>
          <Grid item xs={5}>
            <TextField label="Name" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Age" value=''
              >
                <MenuItem value={10}>String</MenuItem>
                <MenuItem value={20}>Number</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <Button variant="outlined" sx={{ height: "100%", width: "100%" }}>
              Delete
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };
  