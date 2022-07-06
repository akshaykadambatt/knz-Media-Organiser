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
import { IoIosAddCircleOutline, IoMdAdd } from 'react-icons/io';
import { IoAddOutline } from 'react-icons/io5';
import { MdOutlineDelete } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import { alpha, Autocomplete,createFilterOptions, Card, FilterOptionsState } from '@mui/material';

export default function AddTagsModal({open, setOpen}:any) {
  const { db, setDb } = useKmoContext();
  const [count, setCount] = useState<Tag[]>(db.config.tags);
  const theme = useTheme();

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
  
  // [
  //   {
  //     name: "Album name",
  //     id: "asdfasd",
  //     items: ["path/to/file.jpg", "path/to/file.jpg", "path/to/file.jpg"]
  //   },
  //   {
  //     name: "Album name",
  //     id: "asdfasd",
  //     items: ["path/to/file.jpg", "path/to/file.jpg", "path/to/file.jpg"]
  //   }
  // ]

  return (
    <div>
      <Modal open={open} onClose={handleClose} >
        <Boxy sx={style} >
            <>
          <Typography variant="h3" component="h3">
            Add new tags
          </Typography>
          <Typography sx={{ mt: 3, mb:3 }} gutterBottom>
            Add new tags to help yourself organize the images.
          </Typography>
          {/* {JSON.stringify(count)} */}
          {count.map((item,index)=>(
            <Entry key={index} index={index} data={item} setCount={setCount} count={count} />
          ))}
          <Stack direction="row" spacing={2} sx={{marginTop: 3}}>
          <Button onClick={()=>{
            // setCount(Object.assign({[Object.entries(count).length]:""},count))
            setCount([...count,{id: "", name: "",type: "",values: []}])
          }} variant="contained" startIcon={<IoIosAddCircleOutline />}>Add New Tag</Button>
          <Button onClick={handleClose} variant="outlined" >Close</Button>

          </Stack>
          </>
        </Boxy>
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
  const { getUniqueId } = useKmoContext();
  const [name, setName] = useState( data.name || "");
  const [type, setType] = useState(data.type || "");
  const [deleteItem, setDeleteItem] = useState(false);
  const nameRef = createRef<HTMLInputElement>()

  useEffect(() => nameRef.current?.focus(), [])

  useEffect(() => {
    count[index] = {id: getUniqueId(), name: name,type: type,values: [...count[index].values]}
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
          <TextField label="Name" size="small" inputRef={nameRef} onChange={handleNameChange} defaultValue={name} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select onChange={handleTypeChange} label="Age" value={type} size="small">
              <MenuItem value={"number"}>Number</MenuItem>
              <MenuItem value={"string"}>String</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <Button  
            color="warning" 
            startIcon={<AiOutlineDelete />}
            onClick = {()=>setDeleteItem(true)} 
            variant="outlined" 
            sx={{ height: "100%", width: "100%" }}>
            Delete
          </Button>
        </Grid>
      </Grid>
    </div>
  :null);
};

const style = {
  bgcolor: 'background.paper',
  boxShadow: 24,p: 4,
};

const Boxy = styled(Box)(({ theme }) => (`
  position: absolute;
  top: 50%;left: 50%;transform: translate(-50%, -50%);width: 70vw;max-height: 90vh;
  overflow-y:scroll;  
  border-radius: 6px;
  ::-webkit-scrollbar { 
    display: none; 
  }
`))