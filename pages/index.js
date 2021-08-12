import Head from 'next/head'
import MainComponent from '../components/MainComponent'
import React from 'react'
import authenticate from '../middleware/authenticate'
import nextConnect from 'next-connect'

export default function Home() {
  return (
    <>
      <Head>
        <title>Calendar</title>
      </Head>
      <MainComponent />
    </>
  )
}

export async function getServerSideProps(context) {
  // get ServerSideProps context is not recognizing the authenticated from the server session.
  // try to run express handler but that doesn't work either
  const handler = nextConnect()
  handler.use(authenticate)

  return {
    props: {}
  }
}