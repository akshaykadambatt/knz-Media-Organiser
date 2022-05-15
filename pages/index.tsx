import React, {useState,Dispatch, SetStateAction} from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import Main from '../components/Main'
import { KmoContext } from '../components/context';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';  
import { Container } from '@mui/material';
const themeOptions = {
  typography: {
    fontFamily: "'Source Sans Pro', sans-serif",
    textTransform: "none",
    fontWeight:300,
    h1: {
      fontWeight: 100,
      "@media (max-width: 400px)": { fontSize: "46px" }
    },
    h2: {
      fontWeight: 100,
      "@media (max-width: 400px)": { fontSize: "30px" }
    },
    h3: {
      fontWeight: 100,
    },
    h4: {
      fontWeight: 100
    },
    h5: {
      fontWeight: 100
    },
    h6: {
      fontWeight: 100
    },
    body1: {
      fontWeight: 300,
      fontSize: 18
    },
    body2: {
      fontWeight: 600
    },
    button: {
      fontWeight: 600,
    }
    }
};
let theme = createTheme(themeOptions);
theme = responsiveFontSizes(theme);
const Home: NextPage = () => {
  const [folder, setFolder] = useState({} as FileSystemDirectoryHandle);
  const [dbHandle, setDbHandle] = useState({} as FileSystemFileHandle);
  const [db, setDb] = useState({} as Record<string, any>);
  const [filesFound, setFilesFound] = useState(0 as number);
  const [viewer, setViewer] = useState(false);
  const [file, setFile] = useState(0);
  const [cache, setCache] = useState([] as any[]);
  const getFileRecursively: any = async (path: string[], folderToLookIn: FileSystemDirectoryHandle, index: number) => {
    let dir:string = path.shift() || "";
    if(cache[index]) return [cache[index], ""]
    if(path.length == 0){
      let fileHandle = await folderToLookIn.getFileHandle(dir, {})
      const file = await fileHandle.getFile()
      cache[+index] = URL.createObjectURL(file)
      setCache(cache)
      return [cache[index], file]
    }else{
      let newFolder = await folderToLookIn.getDirectoryHandle(dir,{create: true})
      return getFileRecursively(path, newFolder, index)
    }
  }
  
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>KMO</title>
        <meta name="description" content="KMO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
      <Typography variant="h1" pt={11} >K Media Organiser</Typography>
      <Typography>
        A configuration file will be created in the selected folder. Please do not 
        remove the <code>db.json</code> file. No data is sent to the server from your computer, that is,
        your images, files, directory structure, configuration files, file metadata, etc are 
        all maintained locally, securely. Keep in mind that actions like renaming deletion, etc.
        will affect your real files and might be irriversible.
      </Typography>
      <KmoContext.Provider value={{ 
        folder, setFolder, 
        dbHandle, setDbHandle, 
        db, setDb, 
        filesFound, setFilesFound,
        viewer, setViewer,
        file, setFile,
        getFileRecursively,
        cache, setCache
        }}>
        <Main/>
      </KmoContext.Provider>
      </Container>
    </ThemeProvider>
  )
}

export default Home
