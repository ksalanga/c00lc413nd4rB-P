import React, {useState} from 'react'
import styles from '../styles/Home.module.css'
import Form from './Form.js'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

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

function CalendarForm(props) {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState([])
    const [decided, setDecided] = useState()
    const [value, onChange] = useState(new Date())
    const colLength = props.liveEvents ? 2 : 3
    const rowLength = props.myEvents ? 2 : 3
    var content = []

    function showContent() {
      if (step == 0) {
        content = [
          <span className={styles.calendarType} onClick={() => {
            setStep(step + 1)
            setDecided(false)
          }}>
            I Have a Rough Estimate of the Dates
          </span>,
          <span className={styles.calendarType} onClick={() => {
            setStep(step + 1)
            setDecided(true)
          }}>
            I know the exact Date(s)
          </span>
        ] 
          
      } else if (step == 1) {
        content = [
          <button onClick={() => setStep(step - 1)}>Back</button>,
          <Form next={() => setStep(step + 1)} submit={(data) => setForm(data)}/>
        ]
      } else {
        content = [
          <Calendar selectRange={true} onChange={onChange}
          value={value}/>,
          form.map((item) => {return(<div>{item}</div>)})
        ]
      }

      return content
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