import {useState} from 'react'
import styles from '../styles/Home.module.css'
import Form from './Form.js'
import Calendar from 'react-calendar'

function Content(props) {
  const step = props.step
  const setStep = props.setStep
  const setDecided = props.setDecided
  if (step == 0) {
    return(
      <>
        <span className={styles.calendarType} onClick={() => {
          setStep(step + 1)
          setDecided(false)
        }}>
          I Have a Rough Estimate of the Dates
        </span>
        <span className={styles.calendarType} onClick={() => {
          setStep(step + 1)
          setDecided(true)
        }}>
          I know the exact Date(s)
        </span>
      </>
    )
  } else if (step == 1) {
    return(
      <>
        <Form next={() => setStep(step + 1)} submit={(data) => props.setForm(data)} setStep={setStep}/>
      </>
    )
  } else {
    return(
      <>
      <Calendar/>
      {props.form.map((item, index) => {return(<div key={index}>{item}</div>)})}
      </>
    )
  }
}

export default function CalendarForm(props) {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState([])
    const [decided, setDecided] = useState()
    const colLength = props.liveEvents ? 2 : 3
    const rowLength = props.myEvents ? 2 : 3
    var content = []

    return (
        <div className={styles.calendarComponent} style={{
            gridRowEnd: rowLength,
            gridColumnEnd: colLength
        }}>
          <Content step={step} form={form} setStep={setStep} setForm={setForm} setDecided={setDecided}/>
        </div>
    )
}