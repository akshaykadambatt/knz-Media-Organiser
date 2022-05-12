import React from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import Main from '../components/Main'
import { KmoContext } from '../components/context';

const Home: NextPage = () => {
  const [folder, setFolder] = React.useState({} as FileSystemDirectoryHandle);
  const [dbHandle, setDbHandle] = React.useState({} as FileSystemFileHandle);
  const [db, setDb] = React.useState("");
  
  return (
    <>
      <Head>
        <title>KMO</title>
        <meta name="description" content="KMO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <KmoContext.Provider value={{ folder, setFolder, dbHandle, setDbHandle, db, setDb }}>
      <Main/>
      </KmoContext.Provider>
    </>
  )
}

export default Home
