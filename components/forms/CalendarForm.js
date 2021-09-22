import React, {useState, useEffect} from 'react'
import Image from 'next/image'
import MultiCalendar from '../MultiCalendar'
import AutoComplete from '../utils/AutoComplete'
import { getLatLng, geocodeByAddress } from 'react-places-autocomplete'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import styles from '../../styles/Home.module.css'
import animationStyles from '../../styles/animations.module.css'
import undecidedCalendar from '../../public/undecidedCalendar.svg'
import decidedCalendar from '../../public/date.svg'
const fadeInUp = animationStyles.animated + ' ' + animationStyles.animatedFadeInUp + ' ' + animationStyles.fadeInUp

export default function CalendarForm(props) {
    const t = 'T00:00:00'
    const decided = props.decided
    const form = props.form
    const formExists = Object.keys(form).length
    const [minDate, setMinDate] = useState(formExists ? formatDate(form.dates[0]) : '')
    const [maxDate, setMaxDate] = useState(formExists ? formatDate(form.dates[form.dates.length - 1]) : '')
    const [dates, setDates] = useState(formExists ? form.dates : [])
    const [address, setAddress] = useState(formExists ? form.address : '')
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
            expires = null
        } else if (parseInt(expirationDate.split('-')[2]) === parseInt(minSelect.split('-')[2])) { // parses Day from ISO String
            // Hours must be precise for this case:
            // If the expiration date is tomorrow (minSelect) and it is undecided
            // Reason: If someone is editing this form today, but today is at 11:59 PM.
            // Since most of my new Date JS functions are 0'ing out the hours,
            // Just using the selected Tomorrow Value will also 0 out the date times.
            // If this is the case, users who want to add their available dates only have 1 minute.
            // So, we must take the precise time of today including hours, minutes and seconds, so that an actual 24 hours is added.
            // This line does exactly that by making today the new Date and adding one day. (A date with no 0ing of hours, minutes, seconds)
    
            expires = today.addDays(1)
        } else {
            // Every other expiration date can have an expiration date with only the highest order of precision being the day.
            // All lower time values (hours, minutes, seconds) are 0.
            expires = new Date(expirationDate + t)
        }

        if (formExists) { // If the form exists, we can save Google API calls if someone goes back by checking if the address is the same
            if (address.toLowerCase() === props.form.address.toLowerCase()) {
                var latLng = props.form.latLng
            } else {
                var latLng = await getGeoCode(address)
            }
        } else {
            var latLng = await getGeoCode(address)
        }

        // Calendar dates are all in the time zone of the local machine of the user at 12 AM of each day.
        const form = {
            localLocation: Intl.DateTimeFormat().resolvedOptions().timeZone,
            privateOrPublic: privOrPublic[0] ? 'private' : 'public',
            dates: dates, 
            maximumPeople: maxPeople,
            // geoCode key might not be needed.
            address: {name: address, geoCode: latLng}, 
            selectionExpirationDate: expires,
        }

        // on Submit is going to fetch and POST to the MongoDB database.
        props.submit(form)
        props.next()
    }

    const [displayMin, setDisplayMin] = useState('')
    const [displayMax, setDisplayMax] = useState('')
    const [displayExp, setDisplayExp] = useState('')

    useEffect(() => {
        if (dates.length == 0) {
            setMinDate('')
            setDisplayMin('')
            setMaxDate('')
            setDisplayMax('')
        } else if (dates.length == 1) {
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

    // If start date, expiration date, or end date are typed, we have to set boundaries:
    // start date: if value.getTime() < TODAY, don't setMinDate
    // end date: if value.getTime() < minDate, don't setMaxDate
    // expiration Date, if expiration Date.getTime() < TODAY or greater than minDate, don't set Expiration Date
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
  
export function CalendarNameStep({setStep, setForm, form, step}) {
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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

    if (month.length < 2) 
        month = '0' + month
    if (day.length < 2) 
        day = '0' + day

    return [year, month, day].join('-')
}