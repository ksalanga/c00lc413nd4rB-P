import React, {useState, useEffect} from 'react'
import MultiCalendar from '../MultiCalendar'
import AutoComplete from '../utils/AutoComplete'
import { getLatLng, geocodeByAddress } from 'react-places-autocomplete'

function Form(props) {
    const [minDate, setMinDate] = useState("")
    const [maxDate, setMaxDate] = useState("")
    const [dates, setDates] = useState([])
    const [address, setAddress] = useState("")
    const [previousDates, setPreviousDates] = useState([])
    const [expirationDate, setExpirationDate] = useState("")
    const [privOrPublic, setPrivOrPublic] = useState([false, false])
    const [maxPeople, setMaxPeople] = useState("")
    const [graphicSelector, switchSelector] = useState(false)
    const today = new Date(Date.parse(new Date().toLocaleDateString())).toISOString().split('T')[0]
    
    const getGeoCode = async (address) => {
        try {
            const results = await geocodeByAddress(address)
            const geoCode = await getLatLng(results[0])
            return geoCode
        } catch (error) {
            alert(error)
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
        if (maxPeople === "" || minDate === "" || maxDate === "" || !privOrPublic.includes(true) || address === "" || expirationDate === "") return

        const latLng = await getGeoCode(address)
        // Calendar Dates are all in UTC standard which is an issue. We've to convert all of them to the timezone.
        const form = {
            privateOrPublic: privOrPublic[0] ? "private" : "public",
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

    // If start date, expiration date, or end date are typed, we have to set boundaries:
    // start date: if value.getTime() < today, don't setMinDate
    // end date: if value.getTime() < minDate, don't setMaxDate
    // expiration Date, if expiration Date.getTime() < today or greater than minDate, don't set Expiration Date

    useEffect(() => {
        if (dates.length == 0) {
            setMinDate("")
            setMaxDate("")
        } else if (dates.length == 1) {
            setMinDate(formatDate(dates[0]))
            setMaxDate(formatDate(dates[0]))
        } else {
            dates.sort((a, b)=>{return a.getTime() - b.getTime()})
            setMinDate(formatDate(dates[0]))
            setMaxDate(formatDate(dates[dates.length - 1]))
        }
    }, [dates])

    useEffect(() => {
        if (minDate !== "") {
            const expirationDate = minDate === today ? today :
            new Date(minDate + 'T00:00:00').addDays(-1).toISOString().split('T')[0]
            setExpirationDate(expirationDate)
        }
    }, [minDate])

    const handleChange = e => {
        const newDate = new Date(e.target.value + 'T00:00:00')
        if (newDate.getTime() < new Date(today + 'T00:00:00').getTime()) return
        setMinDate(e.target.value)
        if (maxDate != '') {
            let startDate = new Date(e.target.value + 'T00:00:00')
            let endDate = new Date(maxDate + 'T00:00:00')
            if (startDate.getTime() > endDate.getTime()) {
                document.getElementById("endDay").value = ""
                setMaxDate('')
            }
        }
    }

    const handleClick = e => {
        e.target.id === "private" ? setPrivOrPublic([true, false]) : setPrivOrPublic([false, true])
    }

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
            <input type="radio" id="private" name="privOrPublic" onChange={handleClick} checked={privOrPublic[0]}/>Private
            <input type="radio" id="public" name="privOrPublic" onChange={handleClick} checked={privOrPublic[1]}/>Public
            <label htmlFor="people" style={{paddingLeft: "20px", paddingRight: "5px"}}> Maximum Amount of People</label>
            <input type="number" id="people" min="1" max="300" onChange={e => setMaxPeople(e.target.value)} onSubmit={(e) => {e.preventDefault()}} value={maxPeople}/>
            <br/><br/>
            <label htmlFor="startDay" style={{paddingRight: "5px"}}>Start Date</label>
            <input type="date" id="startDay" value={minDate} min={today} onChange={handleChange}/>
            { minDate != "" &&
                <>
                    <label htmlFor="endDay" style={{marginLeft: "10px", paddingRight: "5px"}}>End Date</label>
                    <input type="date" id="endDay" value={maxDate} min={minDate} onChange={(e) => {
                        const newDate = new Date(e.target.value + 'T00:00:00')
                        if (newDate.getTime() < new Date(today + 'T00:00:00').getTime() ||
                        newDate.getTime() < new Date(minDate + 'T00:00:00').getTime()) return
                        setDates(getDates(new Date(minDate+'T00:00:00'), new Date(e.target.value+'T00:00:00')))
                        setMaxDate(e.target.value)
                    }}/>
                    <br></br><br></br>
                    <label htmlFor="expirationDay" style={{paddingRight:"5px"}}>Last Day Users can Edit this Calendar</label>
                    <input type="date" id="expirationDay" value={expirationDate} min={today} max={minDate} onChange={(e) => {
                        const newDate = new Date(e.target.value + 'T00:00:00')
                        if (newDate.getTime() < new Date(today + 'T00:00:00').getTime() ||
                        newDate.getTime() > new Date(minDate + 'T00:00:00').getTime()) return
                        setExpirationDate(e.target.value)
                    }}/>
                </>
            }
            <br></br><br></br>
            <AutoComplete address={address} setAddress={setAddress}></AutoComplete>
            <br></br><br></br>
            <button id="submit" type="submit" value="Submit">Submit ➡️</button>
        </form>
        <button onClick={(e) => {
            e.preventDefault()
            setPreviousDates(dates)
            switchSelector(true)
        }} style={{marginLeft: "10px"}}>📅 graphical selector</button>
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