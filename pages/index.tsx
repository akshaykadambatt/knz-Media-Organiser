import type { NextPage } from 'next'
import Head from 'next/head'
import Main from './components/Main'
import { Provider } from 'react-redux'
import {store} from './components/store'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>KMO</title>
        <meta name="description" content="KMO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider store={store}>
      <Main/>
      </Provider>
    </>
  )
}

export default Home
