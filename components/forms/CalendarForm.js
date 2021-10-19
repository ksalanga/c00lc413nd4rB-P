import React, {useState, useEffect} from 'react'
import Image from 'next/image'
import { MultiCalendar, formatDate } from '../MultiCalendar.js'
import AutoComplete from '../utils/AutoComplete'
import { getLatLng, geocodeByAddress } from 'react-places-autocomplete'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import styles from '../../styles/Home.module.css'
import animationStyles from '../../styles/animations.module.css'
import undecidedCalendar from '../../public/undecidedCalendar.svg'
import decidedCalendar from '../../public/date.svg'
import { add, format } from 'date-fns'

const fadeInUp = animationStyles.animated + ' ' + animationStyles.animatedFadeInUp + ' ' + animationStyles.fadeInUp

export default function CalendarForm(props) {
    const t = 'T00:00:00'
    const decided = props.decided
    const form = props.form
    const formExists = Object.keys(form).length
    const [minDate, setMinDate] = useState(formExists ? formatDate(form.dates[0]) : '')
    const [maxDate, setMaxDate] = useState(formExists ? formatDate(form.dates[form.dates.length - 1]) : '')
    const [dates, setDates] = useState(formExists ? form.dates : [])
    const [address, setAddress] = useState(formExists ? form.address.name : '')
    const [expirationDate, setExpirationDate] = useState(formExists ? formatDate(form.selectionExpirationDate) : '')
    const [privOrPublic, setPrivOrPublic] = useState(formExists ? (form.privateOrPublic === 'private' ? [true, false] : [false, true]) : [false, false])
    const [maxPeople, setMaxPeople] = useState(formExists ? form.maximumPeople : '')
    
    // This soon might not be needed.
    const getGeoCode = async (address) => {
        try {
            const results = await geocodeByAddress(address)
            const geoCode = await getLatLng(results[0])
            return geoCode
        } catch (error) {
            console.log(error)
        }
    }

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf())
        date.setDate(date.getDate() + days)
        return date
    }

    const today = new Date()
    const addOneDay = decided ? 0 : 1
    const minSelect = new Date(Date.parse(today.addDays(addOneDay).toLocaleDateString())).toISOString().split('T')[0]

    function getDates(startDate, stopDate) {
        var dateArray = new Array()
        var currentDate = startDate
        while (currentDate <= stopDate) {
            dateArray.push(new Date (currentDate))
            currentDate = currentDate.addDays(1)
        }
        return dateArray
    }

    async function checkSubmission() {
        if (maxPeople === '' || minDate === '' || maxDate === '' || !privOrPublic.includes(true) || address === '' || (!decided && expirationDate === '')) return

        if (!decided && dates.length <= 1) {
            NotificationManager.warning('For the Undecided feature, at least two days must be selected.', '', 10000)
            return
        }

        // If date is decided, there isn't an expiration date for user editing.
        var expires
        if (decided) {
            // need to instances of the same date so that we have a start and end time
            if (dates.length === 1) {
                dates.push(dates[0])
            }
            expires = null
        } else {
            expires = new Date(expirationDate + t)
        }

        if (formExists) { // If the form exists, we can save Google API calls if someone goes back by checking if the address is the same
            if (address.toLowerCase() === props.form.address.name.toLowerCase()) {
                var latLng = props.form.latLng
            } else {
                var latLng = await getGeoCode(address)
            }
        } else {
            var latLng = await getGeoCode(address)
        }

        // Calendar dates are all in the time zone of the local machine of the user at 12 AM of each day.
        const form = {
            localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            privateOrPublic: privOrPublic[0] ? 'private' : 'public',
            dates: dates, 
            maximumPeople: maxPeople,
            // geoCode key might not be needed.
            address: {name: address, geoCode: latLng}, 
            selectionExpirationDate: expires,
        }

        props.submit(form)
        props.next()
    }

    const [displayMin, setDisplayMin] = useState('')
    const [displayMax, setDisplayMax] = useState('')
    const [displayExp, setDisplayExp] = useState('')

    useEffect(() => {
        if (dates.length === 0) {
            setMinDate('')
            setDisplayMin('')
            setMaxDate('')
            setDisplayMax('')
        } else if (dates.length === 1) {
            const singleDay = formatDate(dates[0])
            setMinDate(singleDay)
            setDisplayMin(singleDay)
            setMaxDate(singleDay)
            setDisplayMax(singleDay)
        } else {
            dates.sort((a, b)=>{return a.getTime() - b.getTime()})
            setMinDate(formatDate(dates[0]))
            setDisplayMin(formatDate(dates[0]))
            setMaxDate(formatDate(dates[dates.length - 1]))
            setDisplayMax(formatDate(dates[dates.length - 1]))
        }
    }, [dates])

    useEffect(() => {
        if (minDate !== '') {
            const minDateInDateFormat = new Date(minDate + t)

            // Inputting minDate values into dates array
            if (dates.length <= 1) {
                setDates([minDateInDateFormat])
            } else { // Filter out all dates that are less than getTime of new minDate.
                setDates(dates.filter(date => date.getTime() >= minDateInDateFormat.getTime()))
            }

            setExpirationDate(minDate)
            setDisplayExp(minDate)
        } else {
            setMaxDate('')
            setDisplayMax('')
            setExpirationDate('')
            setDisplayMax('')
            setDates([])
        }
    }, [minDate])

    const handleChange = e => {
        const selectedDate = e.target.value
        const newDate = new Date(selectedDate + t)
        switch(e.target.id) {
            case 'startDay':
                if (newDate.getTime() < new Date(minSelect + t).getTime()) {
                    setDisplayMin(minDate)
                    return
                }
                setMinDate(selectedDate)
                if (maxDate !== '') {
                    let startDate = newDate // keep note
                    let endDate = new Date(maxDate + t)
                    if (startDate.getTime() > endDate.getTime()) {
                        setMaxDate('')
                        setDisplayMax('')
                    }
                }
                break
            case 'endDay':
                if (newDate.getTime() < new Date(minSelect + t).getTime() 
                ||  newDate.getTime() < new Date(minDate + t).getTime()) {
                    setDisplayMax(maxDate)
                    return
                }
                setDates(getDates(new Date(minDate + t), newDate))
                setMaxDate(selectedDate)
                break
            case 'expirationDay':
                if (newDate.getTime() < new Date(minSelect + t).getTime() ||
                newDate.getTime() > new Date(minDate + t).getTime()) {
                    setDisplayExp(expirationDate)
                    return
                }
                setExpirationDate(selectedDate)
                break
        }
    }

    const handleClick = e => {
        e.target.id === 'private' ? setPrivOrPublic([true, false]) : setPrivOrPublic([false, true])
    }

    return(
        <>
        <NotificationContainer/>
        <button onClick={(e) => {
            e.preventDefault()
            props.setStep(0)
        }} className={fadeInUp}>⬅️</button>
        <form onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()
        }} className={fadeInUp}>
            <h3>Fill in your {decided ? 'Decided ' : 'Undecided '} Event</h3>
            <br></br>
            <input type='radio' id='private' name='privOrPublic' onChange={handleClick} checked={privOrPublic[0]}/>Private
            <input type='radio' id='public' name='privOrPublic' onChange={handleClick} checked={privOrPublic[1]}/>Public
            <label htmlFor='people' style={{paddingLeft: '20px', paddingRight: '5px'}}> Maximum Amount of People</label>
            <input type='number' id='people' min='1' max='300' onChange={e => setMaxPeople(e.target.value)} onSubmit={e => {e.preventDefault()}} value={maxPeople}/>
            <br/><br/>
            <label htmlFor='startDay' style={{paddingRight: '5px'}}>Start Date</label>
            <input type='date' id='startDay' value={displayMin} min={minSelect} onBlur={handleChange} onChange={(e) => setDisplayMin(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
            
            {/* For a decided event, add the beginning time and end time */}
                        
            { minDate != '' &&
                <>
                    <label htmlFor='endDay' style={{marginLeft: '10px', paddingRight: '5px'}}>End Date</label>
                    <input type='date' id='endDay' value={displayMax} min={minDate} onBlur={handleChange} onChange={(e) => setDisplayMax(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
                </>
            }
            { (minDate != '' && !decided) &&
                <>
                    <br></br><br></br>
                    <label htmlFor='expirationDay' style={{paddingRight:'5px'}}>Day users can no longer edit this Calendar</label>
                    <input type='date' id='expirationDay' value={displayExp} min={minSelect} max={minDate} onBlur={handleChange} onChange={(e) => setDisplayExp(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
                </>
            }
            <br></br><br></br>
            <AutoComplete address={address} setAddress={setAddress}></AutoComplete>
            <br></br><br></br>
            <button id='submit' type='submit' value='Submit'>Submit ➡️</button>
        </form>
        <MultiCalendar dates={dates} setDates={setDates} getDates={getDates} minDate={minSelect}></MultiCalendar>
        </>
    )
}

export function CalendarSelectionStep({step, setStep, setDecided}) {
    return (
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
}

export function DatesTimeStep({form, setForm, step, setStep, decided}) {
    const startDate = form['dates'][0],
    startDateString = format(startDate, 'MMMM d, yyyy'),
    endDate = form['dates'][form['dates'].length - 1],
    endDateString = format(endDate, 'MMMM d, yyyy'),
    expirationDate = form['selectionExpirationDate'], 
    expirationDateString = expirationDate ? format(expirationDate, 'MMMM d, yyyy') : ''

    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [expirationTime, setExpirationTime] = useState('')
    const padding = { marginLeft: '12px', paddingRight: '10px' }

    useEffect(() => {}, [form])

    const checkSubmission = () => {
        if (startTime === '' 
        || endTime === '' 
        || (!decided && expirationTime === '')) {
            return
        }

        // before submit, all dates arrays are going to be at 12AM of the local timezone.
        // if someone submits at 11:59PM of today and we start doing the comparison at 12 AM of the next day,
        // no matter how much time you add to today + 11:59 (max value) will always be less than the current time
        // since our functionality only takes the current 12 AM date's value and adds the corresponding hours and minutes
        // our goal is to update this min date value so now, min date will be tomorrow at 12AM,
        // we must also update maxDate
        // this problem only arrises on Decided Dates because for an undecided event, we always have a one day buffer
        if (decided) {
            const startDateDay = startDate.getDate()
            const startDateMonth = startDate.getMonth()
            const startDateYear = startDate.getFullYear()

            const rightNow = new Date()
            if (startDateDay < rightNow.getDate() 
            && startDateMonth < rightNow.getMonth() 
            && startDateYear < rightNow.getFullYear()) {
                var updatedDates = form['dates']

                if (updatedDates[0].getTime() === updatedDates[updatedDates.length - 1].getTime()) {
                    updatedDates[0] = new Date(format(rightNow, 'yyyy-MM-dd') + 'T00:00:00')
                    updatedDates[updatedDates.length - 1] = updatedDates[0]
                } else {
                    updatedDates[0] = new Date(format(rightNow, 'yyyy-MM-dd') + 'T00:00:00')
                }

                setForm({...form, dates: updatedDates})
                return
            }
        }

        const startDateWithTime = add(startDate, {
            hours: parseInt(startTime.split(':')[0]),
            minutes: parseInt(startTime.split(':')[1])
        })

        if (startDateWithTime.getTime() < new Date().getTime()) {
            NotificationManager.warning('Begin time must be greater than the time right now', '', 10000)
            return
        }

        const endDateWithTime = add(endDate, {
            hours: parseInt(endTime.split(':')[0]),
            minutes: parseInt(endTime.split(':')[1])
        })

        if (startDateWithTime.getTime() > endDateWithTime.getTime()) {
            NotificationManager.warning('Begin time must be less than the end time', '', 10000)
            return
        }

        var datesWithTime = form['dates'] // accessing this part of the form should be fine
        // form dates values won't mutate unless we tell react to update the state using setForm
        // so getting these array values is still technically creating a copy
        datesWithTime[0] = startDateWithTime 
        datesWithTime[datesWithTime.length - 1] = endDateWithTime
        if (!decided) {
            const expirationDateWithTime = add(expirationDate, {
                hours: parseInt(expirationTime.split(':')[0]),
                minutes: parseInt(expirationTime.split(':')[1])
            })

            if (expirationDateWithTime.getTime() < new Date().getTime()) {
                NotificationManager.warning('Expiration time must be greater than the time right now', '', 10000)
                return
            }

            if (expirationDateWithTime.getTime() > startDateWithTime.getTime()) {
                NotificationManager.warning('Expiration time must be less than begin time', '', 10000)
                return
            }

            setForm({...form, dates: datesWithTime, selectionExpirationDate: expirationDateWithTime}) 
        } else {
            setForm({...form, dates: datesWithTime})
        }

        setStep(step + 1)
    }

    return (
        <>
        <NotificationContainer/>
        <button onClick={(e) => {
            e.preventDefault()
            setStep(1)
        }} className={fadeInUp}>⬅️</button>
        <div className={fadeInUp}>
            
            <h2>Time to decide on the time! ;)</h2>
            <br></br>
            <form onSubmit={(e) => {
                e.preventDefault()
                checkSubmission()
            }}>
                <label htmlFor='startDateTime' style={padding}>What time will the start date ({startDateString}) begin?</label>
                <input id='startDateTime' type='time' onChange={(e) => setStartTime(e.target.value)}></input>
                <br></br><br></br>
                <label htmlFor='endDateTime' style={padding}>What time will the end date ({endDateString}) end?</label>
                <input id='endDateTime' type='time' onChange={(e) => setEndTime(e.target.value)} style={padding}></input>
                {
                    !decided
                    &&
                    <>
                    <br></br><br></br>
                    <label htmlFor='expirationDateTime' style={padding}>When will the expiration date ({expirationDateString}) end?</label>
                    <input id='expirationDateTime' type='time' onChange={(e) => {setExpirationTime(e.target.value)}}></input>
                    </>
                }
                <br></br><br></br>
                <button id='submit' type='submit' value='Submit'>Submit ➡️</button>
            </form>
        </div>
        </>
    )
}
  
export function CalendarNameStep({form, setForm, step, setStep}) {
    const [name, setName] = useState('')
    return (
    <>
        <button onClick={(e) => {
            e.preventDefault()
            setStep(step - 1)
        }} className={fadeInUp}>⬅️</button>
        <div className={fadeInUp}>
        <h1><b>Awesome!</b></h1>
        <h2>All we need now is to name your Event:</h2>
        <br></br>
        <input size='70' type="text" onChange={(e) => {setName(e.target.value)}}></input>
        <br></br>
        <br></br>
        <button onClick={(e) => {
            e.preventDefault()
            if (name === '') return
            setForm({...form, name: name})
            setStep(step + 1)
        }}>Submit</button>
        </div>
    </>
    )
}