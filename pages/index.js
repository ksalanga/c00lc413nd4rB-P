import Head from 'next/head'
import MainComponent from '../components/MainComponent'
import Image from 'next/image'
import React from 'react'
import styles from '../styles/Home.module.css'

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