import Head from 'next/head'
import MainComponent from '../components/MainComponent'
import React from 'react'

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