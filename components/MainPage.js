import {useState} from 'react'
import styles from '../styles/Home.module.css'
import {default as CalendarForm, CalendarSelectionStep, CalendarNameStep, DatesTimeStep} from './forms/CalendarForm.js'
import Calendar from 'react-calendar'
import FormSubmission from './utils/FormSubmission'
import { Loading } from 'react-loading-dot/lib'

function Content({user, step, setStep, form, setForm, decided, setDecided}) {
  if (step == 0) { // ** Choosing if Event is Decided or Undecided **
    return(<CalendarSelectionStep step={step} setStep={setStep} setDecided={setDecided}/>) 
  } else if (step == 1) { // ** Main bulk of the Form **
    return(<CalendarForm next={() => setStep(step + 1)} setStep={setStep} decided={decided} form={form} submit={(data) => setForm(data)}/>)
  } else if (step == 2) { // Once dates are decided, set the begin time and end times for the event.
    return(<DatesTimeStep form={form} setForm={setForm} step={step} setStep={setStep} decided={decided}/>)
  } else if (step == 3) { // ** Choosing Name **
    return (<CalendarNameStep setStep={setStep} setForm={setForm} form={form} setStep={setStep} step={step}/>)
  } else { // ** Post Form Data here **
    // UserCreated, Users, Address, TimeZone, DST
    // If user doesn't exist, save the form
    const { isLoading, isError } = FormSubmission(user, form, decided)

    if (isLoading) return ( <Loading />) 
    if (isError) return ( <div>Something went wrong on the server submitting your Calendar!</div> )

    return(<div><h1>GZ</h1><Calendar/></div>)
  }
}

export default function MainPage({user}) {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({})
    const [decided, setDecided] = useState()

    return (
        <div className={styles.mainContent + ' ' + styles.calendarComponent} style={{
            gridRowEnd: 3,
            gridColumnEnd: 3
        }}>
          <Content user={user} step={step} setStep={setStep} form={form} setForm={setForm} decided={decided} setDecided={setDecided}/>
        </div>
    )
}