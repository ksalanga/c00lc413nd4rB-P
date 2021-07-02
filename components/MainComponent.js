import React, {useState} from 'react'
import styles from '../styles/Home.module.css'

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
            <form>
                <input type="radio" id="private" name="privOrPublic"/>Private
                <input type="radio" id="public" name="privOrPublic"/>Public
                <br/><br/>
                <label for="people">Maximum Amount of People</label>
                <input type="number" id="people"/>
                <br/><br/>
                <label for="startDay">Start Date</label>
                <input type="date" id="startDay"/>
                <label for="endDay">End Date</label>
                <input type="date" id="endDay"/>
                <br/><br/>
                <input type="submit" value="Submit"/>
            </form>
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