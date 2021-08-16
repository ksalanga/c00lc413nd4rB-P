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

export async function getServerSideProps(context) {
  console.log(context.req)
  const res = await fetch('/api/users/userAuth')
  if (res.ok) {
      const data = await res.json()
      var user = data.user 
  } else {
      var user = undefined
  }
  return { props: { user } }
}