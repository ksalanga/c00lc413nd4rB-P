import React, {useState} from 'react'
import styles from '../styles/Home.module.css'
import Form from './Form.js'

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

function Calendar(props) {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState([])
    const colLength = props.liveEvents ? 2 : 3
    const rowLength = props.myEvents ? 2 : 3

    function showContent() {
      if (step == 0) {
        return (
          <>
            <span className={styles.calendarType} onClick={() => setStep(step + 1)}>
              I Have a Rought Estimate of the Dates
            </span>
            <span className={styles.calendarType} onClick={() => setStep(step + 1)}>
              I know the exact Date(s)
            </span>
          </>
        )
      } else if (step == 1) {
        return (
          <>
            <button onClick={() => setStep(step - 1)}>Back</button>
            <Form next={() => setStep(step + 1)} submit={(data) => setForm(data)}/>
          </>
        )
      } else {
        return(
          <>
            {form.map((item) => {return(<div>{item}</div>)})}
          </> 
        )
      }
    }

    return (
        <div className={styles.calendarComponent} style={{
            gridRowEnd: rowLength,
            gridColumnEnd: colLength
        }}>
          {showContent()}
        </div>
    )
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
          <h1 className={styles.centered}>Cool Calendar B-P 📅</h1>
          <div className={styles.mainContent}>
            <Calendar liveEvents={this.state.liveEvents} myEvents={this.state.myEvents}/>
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