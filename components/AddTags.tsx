import React, { useState, useRef, useEffect, SetStateAction, createRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useKmoContext } from './context';
import Stack from '@mui/material/Stack';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "70vw",maxHeight: "90vh",
  overflowY:"scroll",
  bgcolor: 'background.paper',
  borderRadius: '6px',
  boxShadow: 24,p: 4,
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
  const [count, setCount] = useState(db.config.tags);
  useEffect(() => {
    console.log("db.config.tags", db.config.tags);
    return;
  }, )
  
  
  return (
    <div>
      <Modal open={open} onClose={handleClose} >
        <Box sx={style} >
            <>
          <Typography variant="h2" component="h2">
            Add new tags
          </Typography>
          <Typography sx={{ mt: 3, mb:3 }} gutterBottom>
            Add new tags to help yourself organize the images.
          </Typography>
          {Object.entries(count).map((item,index)=>(
              <Entry key={index} id={index} data={item}/>
          ))}
          <Stack direction="row" spacing={2} sx={{marginTop: 3}}>
          <Button onClick={()=>setCount(Object.assign({[Object.entries(count).length]:""},count))} variant="contained" >Add New Tag</Button>
          <Button onClick={handleClose} variant="outlined" >Close</Button>

          </Stack>
          </>
        </Box>
      </Modal>
    </div>
  );
}



const Entry = ({id, data}:any) => {
    const { 
        db, setDb
      } = useKmoContext();
    const [name, setName] = useState(Object.keys(data[1])[0] as string|| "" as string);
    const [type, setType] = useState((Object.values(data[1])[0] || "") as string);
    const [deleteItem, setDeleteItem] = useState(false);
    const nameRef = createRef<HTMLInputElement>()
    const typeRef = createRef<HTMLInputElement>()
    useEffect(() => nameRef.current?.focus(), [])
    useEffect(() => {
        if(deleteItem){
            delete db.config.tags[id]
            setDb(db)
        }else if(name){
            db.config.tags[id] = {[name]:type}
            setDb(db)
        }
        return;
    }, [name, type, deleteItem])
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value as string)
    const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value as string)

    return (!deleteItem ?
      <>
        <Grid container spacing={3} sx={{paddingTop: 2}}>
          <Grid item xs={5}>
            <TextField label="Name" inputRef={nameRef} onChange={handleNameChange} defaultValue={name} variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Type</InputLabel>
              <Select onChange={handleTypeChange} label="Age" value={type}>
                <MenuItem value={""}></MenuItem>
                <MenuItem value={"number"}>Number</MenuItem>
                <MenuItem value={"string"}>String</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <Button  color="warning" onClick = {()=>setDeleteItem(true)} variant="outlined" sx={{ height: "100%", width: "100%" }}>
              Delete
            </Button>
          </Grid>
        </Grid>
      </>
    :null);
  };
  