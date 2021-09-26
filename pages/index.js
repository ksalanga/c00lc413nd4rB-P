import Head from 'next/head'
import MainPage from '../components/MainPage'
import React from 'react'
import Navbar from '../components/nav/Navbar'
import nextConnect from 'next-connect'
import authenticate from '../middleware/authenticate'

export default function Home({ user }) {
  const googleMapsScript = process.browser && <script id='googleMaps' defer async src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_KEY}&libraries=places`}/>
  
  return (
    <>
      <Head>
        <title>Calendar</title>
        {googleMapsScript}
      </Head>
      <Navbar user={ user }/>
      <MainPage user={ user }/>
    </>
  )
}

export async function getServerSideProps({ req, res }) {
  const handler = nextConnect().use(authenticate)

  try {
    await handler.run(req, res)
    var user = req.session?.get('user')
    if (user === {} || user === undefined) { 
      return {
        redirect: {
            destination: '/login',
            permanent: false,
        },
      }  
    }

    return { props: { user } }
  } catch (e) {
    console.log(e)
    return { props: {} }
  }
}