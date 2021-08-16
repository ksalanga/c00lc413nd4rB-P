import Head from 'next/head'
import MainComponent from '../components/MainComponent'
import React from 'react'
import Navbar from '../components/nav/Navbar'
import nextConnect from 'next-connect'
import { checkAuthentication } from '../middleware/authenticate'


export default function Home({ user }) {
  return (
    <>
      <Head>
        <title>Calendar</title>
      </Head>
      <Navbar user={user}/>
      <MainComponent />
    </>
  )
}

export async function getServerSideProps(context) {
  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : process.env.VERCEL_URL

  const response = await fetch(`${url}/api/users/userAuth`)
  const data = await response.json()
  
  const handler = nextConnect()
  handler.use(checkAuthentication)

  try {
    await handler.run(req, res)
  } catch (e) {
    console.log(e)
  }
  console.log('context req')
  console.log(context.req)

  // if (res.ok) {
  //     var user = data.user 
  // } else {
  //     var user = null
  // }

  return { props: { } }
}