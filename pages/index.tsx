import React, {useState,Dispatch, SetStateAction} from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import Main from '../components/Main'
import { KmoContext } from '../components/context';

const Home: NextPage = () => {
  const [folder, setFolder] = useState({} as FileSystemDirectoryHandle);
  const [dbHandle, setDbHandle] = useState({} as FileSystemFileHandle);
  const [db, setDb] = useState("");
  const [filesFound, setFilesFound] = useState(0 as number);
  
  return (
    <>
      <Head>
        <title>KMO</title>
        <meta name="description" content="KMO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>K Media Organiser</h1>
      <KmoContext.Provider value={{ 
        folder, setFolder, 
        dbHandle, setDbHandle, 
        db, setDb, 
        filesFound, setFilesFound 
        }}>
      <Main/>
      </KmoContext.Provider>
    </>
  )
}

export default Home
