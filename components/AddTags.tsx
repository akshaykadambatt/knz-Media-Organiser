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

interface Tag {
  name: string,
  type: string,
  values: string[],
}

export default function AddTagsModal({open, setOpen}:any) {
  const { db, setDb } = useKmoContext();
  const [count, setCount] = useState<Tag[]>(db.config.tags);

  const handleClose = () => {
    setOpen(false)
    return;
  };
  useEffect(() => {
    db.config.tags = count
    setDb(db)
  }, [count])
  // Tag model:
  // [
  //   {
  //     name: "Category",
  //     kind: "string",
  //     values: ["sl", "bl", "tl"]
  //   },
  //   {
  //     name: "Category",
  //     kind: "string",
  //     values: ["sl", "bl", "tl"]
  //   }
  // ]
  
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
          {JSON.stringify(count)}
          {count.map((item,index)=>(
            <Entry key={index} index={index} data={item} setCount={setCount} count={count} />
          ))}
          <Stack direction="row" spacing={2} sx={{marginTop: 3}}>
          <Button onClick={()=>{
            // setCount(Object.assign({[Object.entries(count).length]:""},count))
            setCount([...count,{name: "",type: "",values: []}])
          }} variant="contained" >Add New Tag</Button>
          <Button onClick={handleClose} variant="outlined" >Close</Button>

          </Stack>
          </>
        </Box>
      </Modal>
    </div>
  );
}

interface IProps {
  index: number,
  data: Tag,
  count: Tag[],
  setCount: (Data: Tag[]) => void
}
const Entry = ({index, data, count, setCount}:IProps) => {
  const { db, setDb } = useKmoContext();
  const [name, setName] = useState( data.name || "");
  const [type, setType] = useState(data.type || "");
  const [deleteItem, setDeleteItem] = useState(false);
  const nameRef = createRef<HTMLInputElement>()

  useEffect(() => nameRef.current?.focus(), [])

  useEffect(() => {
    count[index] = {name: name,type: type,values: []}
    setCount(count)
  }, [name, type])

  useEffect(() => {
    // console.log("before splice", count);
    // console.log("before splice", count);
    if(deleteItem){
      count.splice(index, 1);
      setCount(count)
    }
    return;
  }, [deleteItem])
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value as string)
  const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value as string)

  return (!deleteItem ?
    <div key={index}>
      <Grid container spacing={3} sx={{paddingTop: 2}}>
        <Grid item xs={5}>
          <TextField label="Name" inputRef={nameRef} onChange={handleNameChange} defaultValue={name} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select onChange={handleTypeChange} label="Age" value={type}>
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
    </div>
  :null);
};
