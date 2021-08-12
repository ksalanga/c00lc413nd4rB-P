import React from 'react'
import styles from '../styles/Home.module.css'
import CalendarForm from './forms/CalendarForm.js'
import Profile from '../utils/user'

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
          <Profile />
          <h2 className={styles.centered}>Cool Calendar B-P 📅</h2>
          <div className={styles.mainContent}>
            <CalendarForm liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
            <LiveEvents liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
            <MyEvents liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
          </div>
          <button onClick={() => this.setState({liveEvents: !this.state.liveEvents})}>Live Events</button>
          <button onClick={() => this.setState({myEvents: !this.state.myEvents})}>My Events</button>
        </>
      )
    }
}

export default MainComponent