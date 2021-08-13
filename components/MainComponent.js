import React from 'react'
import styles from '../styles/Home.module.css'
import CalendarForm from './forms/CalendarForm.js'
import Profile from '../utils/user'
import Link from 'next/link'
import Navbar from './nav/Navbar'

function LiveEvents(props) {
    if (props.liveEvents) {
        return (
            <div className={styles.liveEvents}></div>
        )
    }
    return null
}

function MyEvents(props) {
    if (props.myEvents) {
        const columnLength = props.liveEvents ? 2 : 3
        return (
            <div className={styles.myEvents} style={{gridColumnEnd: columnLength}}></div>
        )
    }
    return null
}

class MainComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        liveEvents: false,
        myEvents: false
      }
    }

    render() {
      return (
        <>
          <Navbar />
          {/* <Profile />
          <Link href={'/login'}>login</Link>
          <h3 className={styles.centered}>Cool Calendar B-P 📅</h3> */}
          <div className={styles.mainContent}>
            <CalendarForm liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
            <LiveEvents liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
            <MyEvents liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
          </div>
        </>
      )
    }
}

export default MainComponent