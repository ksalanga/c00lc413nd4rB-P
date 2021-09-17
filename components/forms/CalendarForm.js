import {useState} from 'react'
import styles from '../../styles/Home.module.css'
import Form from './Form.js'
import Calendar from 'react-calendar'
import Image from 'next/image'
import undecidedCalendar from '../../public/undecidedCalendar.svg'
import decidedCalendar from '../../public/date.svg'

function Content(props) {
  const [name, setName] = useState('')
  const step = props.step
  const decided = props.decided
  const setStep = props.setStep
  const setDecided = props.setDecided
  if (step == 0) {
    return(
      <>
        <span className={styles.calendarType + ' ' + styles.dateWrap} onClick={() => {
          setStep(step + 1)
          setDecided(false)
        }}>
          <Image src={undecidedCalendar} width='90%' height='90%'></Image>
          <div className={styles.dateDescriptionLayer} style={{color: "red"}}>
              <p className={styles.dateDescription}>Event Date is NOT yet Decided</p>
          </div>
        </span>
        <span className={styles.calendarType + ' ' + styles.dateWrap} onClick={() => {
          setStep(step + 1)
          setDecided(true)
        }}>
          <Image src={decidedCalendar} width='90%' height='90%'></Image>
          <div className={styles.dateDescriptionLayer} style={{color: "rgb(20, 201, 140)"}}>
              <p className={styles.dateDescription}>Event Date has been Decided</p>
          </div>
        </span>
      </>
    )
  } else if (step == 1) {
    return(
      <>
        <Form next={() => setStep(step + 1)} submit={(data) => props.setForm(data)} setStep={setStep} decided={decided}/>
      </>
    )
  } else if (step == 2) {
    return (
      <>
        <h1>Awesome!</h1>
        <h2>All we need now is to name your Event:</h2>
        <input type="text" onChange={(e) => {setName(e.target.value)}}></input>
        <button onClick={() => {
          if (name === '') return
          props.setForm({...props.form, name: name})
          props.setStep(props.step + 1)
        }}>Submit</button>
      </>
    )
  } else {
    // Post Form Data here with if it's decided or not
    return(
      <>
      <Calendar/>
      </>
    )
  }
}

export default function CalendarForm(props) {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({})
    const [decided, setDecided] = useState()
    const colLength = props.liveEvents ? 2 : 3
    const rowLength = props.myEvents ? 2 : 3

    return (
        <div className={styles.calendarComponent} style={{
            gridRowEnd: rowLength,
            gridColumnEnd: colLength
        }}>
          <Content step={step} form={form} setStep={setStep} setForm={setForm} setDecided={setDecided} decided={decided}/>
        </div>
    )
}