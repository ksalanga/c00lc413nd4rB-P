import React, {useState, useEffect} from 'react'
import MultiCalendar from '../MultiCalendar'
import AutoComplete from '../utils/AutoComplete'
import { getLatLng, geocodeByAddress } from 'react-places-autocomplete'

function Form(props) {
    const t = 'T00:00:00'
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [dates, setDates] = useState([])
    const [address, setAddress] = useState('')
    const [previousDates, setPreviousDates] = useState([])
    const [expirationDate, setExpirationDate] = useState('')
    const [privOrPublic, setPrivOrPublic] = useState([false, false])
    const [maxPeople, setMaxPeople] = useState('')
    const [graphicSelector, switchSelector] = useState(false)
    const today = new Date(Date.parse(new Date().toLocaleDateString())).toISOString().split('T')[0]
    
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
        if (maxPeople === '' || minDate === '' || maxDate === '' || !privOrPublic.includes(true) || address === '' || expirationDate === '') return

        const latLng = await getGeoCode(address)
        // Calendar Dates are all in UTC standard which is an issue. We've to convert all of them to the timezone.
        const form = {
            privateOrPublic: privOrPublic[0] ? 'private' : 'public',
            dates: dates, 
            maximumPeople: maxPeople,
            address: address,
            expirationDate: expirationDate,
            latLng: latLng
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
    // start date: if value.getTime() < today, don't setMinDate
    // end date: if value.getTime() < minDate, don't setMaxDate
    // expiration Date, if expiration Date.getTime() < today or greater than minDate, don't set Expiration Date
    const handleChange = e => {
        const selectedDate = e.target.value
        const newDate = new Date(selectedDate + t)
        switch(e.target.id) {
            case 'startDay':
                if (newDate.getTime() < new Date(today + t).getTime()) {
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
                if (newDate.getTime() < new Date(today + t).getTime() 
                ||  newDate.getTime() < new Date(minDate + t).getTime()) {
                    setDisplayMax(maxDate)
                    return
                }
                setDates(getDates(new Date(minDate + t), newDate))
                setMaxDate(selectedDate)
                break
            case 'expirationDay':
                if (newDate.getTime() < new Date(today + t).getTime() ||
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

    // Separate Comparator value

    return(
        graphicSelector ?
        <>
        <button onClick={(e) => {
            e.preventDefault()
            setDates(previousDates)
            switchSelector(false)
        }}>⬅️</button>
        <MultiCalendar dates={dates} setDates={setDates} switchSelector={switchSelector} getDates={getDates}></MultiCalendar>
        </>
        :
        <>
        <button onClick={(e) => {
            e.preventDefault()
            props.setStep(0)
        }}>⬅️</button>
        <form onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()
        }}>
            <input type='radio' id='private' name='privOrPublic' onChange={handleClick} checked={privOrPublic[0]}/>Private
            <input type='radio' id='public' name='privOrPublic' onChange={handleClick} checked={privOrPublic[1]}/>Public
            <label htmlFor='people' style={{paddingLeft: '20px', paddingRight: '5px'}}> Maximum Amount of People</label>
            <input type='number' id='people' min='1' max='300' onChange={e => setMaxPeople(e.target.value)} onSubmit={e => {e.preventDefault()}} value={maxPeople}/>
            <br/><br/>
            <label htmlFor='startDay' style={{paddingRight: '5px'}}>Start Date</label>
            <input type='date' id='startDay' value={displayMin} min={today} onBlur={handleChange} onChange={(e) => setDisplayMin(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
            
            { minDate != '' &&
                <>
                    <label htmlFor='endDay' style={{marginLeft: '10px', paddingRight: '5px'}}>End Date</label>
                    <input type='date' id='endDay' value={displayMax} min={minDate} onBlur={handleChange} onChange={(e) => setDisplayMax(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
                    {/* value={maxDate === '' ? null : maxDate} */}
                    <br></br><br></br>
                    <label htmlFor='expirationDay' style={{paddingRight:'5px'}}>Day users can no longer edit this Calendar</label>
                    <input type='date' id='expirationDay' value={displayExp} min={today} max={minDate} onBlur={handleChange} onChange={(e) => setDisplayExp(e.target.value)} onKeyPress={(e) => {if (e.code === 'Enter') handleChange(e)}}/>
                </>
            }
            <br></br><br></br>
            <AutoComplete address={address} setAddress={setAddress}></AutoComplete>
            <br></br><br></br>
            <button id='submit' type='submit' value='Submit'>Submit ➡️</button>
        </form>
        <button onClick={(e) => {
            e.preventDefault()
            setPreviousDates(dates)
            switchSelector(true)
        }} style={{marginLeft: '10px'}}>📅 graphical selector</button>
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

export default Form