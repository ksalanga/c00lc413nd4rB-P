import Head from 'next/head'
import MainComponent from '../components/MainComponent'
import React from 'react'
import Navbar from '../components/nav/Navbar'
import nextConnect from 'next-connect'
import authenticate from '../middleware/authenticate'

export default function Home({ user }) {
  return (
    <>
      <Head>
        <title>Calendar</title>
      </Head>
      <Navbar user={ user }/>
      <MainComponent />
    </>
  )
}

export async function getServerSideProps({ req, res}) {
  const handler = nextConnect().use(authenticate)

  try {
    await handler.run(req, res)
    var user = req.session?.get('user')
    if (user === {} || user === undefined) { user = null }
    return { props: { user } }
  } catch (e) {
    console.log(e)
    return { props: {} }
  }
}