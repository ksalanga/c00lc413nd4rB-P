import Head from 'next/head'
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

class MainComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      calendar: {
        gridColumnStart: 1,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 3
      },
      liveEvent: false,
      myEvents: false
    }
  }

  placeComponents() {
    var components = []

    if (this.state.liveEvent) {
      // row end matters
      // calendar col end matters
    } 
    
    if (this.state.myEvents) {
      // col end matters
      // calendar row end matters
    }

    return components
  }

  render() {
    return (
      <>
        <h1 className={styles.centered}>Cool Calendar B-P</h1>
        <div className={styles.mainContent}>
          <div className={styles.calendar} style={this.state.calendar}></div>
          {this.placeComponents}
        </div>
        <button onClick={() => this.setState({liveEvent : !this.state.liveEvent})}>Live Events</button>
        <button onClick={() => this.setState({myEvents : !this.state.myEvents})}>My Events</button>
      </>
    )
  }
}