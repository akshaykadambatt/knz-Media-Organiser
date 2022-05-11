import type { NextPage } from 'next'
import Head from 'next/head'
import Main from './components/Main'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>KMO</title>
        <meta name="description" content="KMO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main/>
    </>
  )
}

export default Home
