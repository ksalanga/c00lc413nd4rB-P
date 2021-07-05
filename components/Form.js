import React, {useState} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function Form(props) {
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [graphicSelector, switchSelector] = useState(false)

    function checkSubmission() {
        var people = document.getElementById("people")
        var startDay = document.getElementById("startDay")
        var endDay = document.getElementById("endDay")
        if (people == null || startDay == null || endDay == null) return
        var submission = []
        var privOrPublic = document.getElementsByName('privOrPublic')

        privOrPublic.forEach((button) => {if (button.checked) submission.push(button.id)})
        submission.push(people.value, startDay.value, endDay.value)
        var emptyEntry = false
        submission.forEach((item) => {if (item === "") {
            emptyEntry = true
            return
        }})
        if (submission.length == 4 && !emptyEntry) {
            props.submit(submission)
            props.next()
        }
    }

    const handleChange = e => {
        setMinDate(e.target.value)
        if (maxDate != '') {
            let startDate = new Date(e.target.value + 'Z')
            let endDate = new Date(maxDate + 'Z')
            if (startDate.getTime() > endDate.getTime()) {
                document.getElementById("endDay").value = ""
                setMaxDate('')
            }
        }
    }

    return(
        graphicSelector ?
        <>
        <button onClick={(e) => {
            e.preventDefault()
            switchSelector(false)
        }}>⬅️</button>
        <Calendar onChange={(dates) => {
            setMinDate(formatDate(dates[0]))
            setMaxDate(formatDate(dates[1]))
            switchSelector(false)
        }} selectRange={true}
        minDetail={"year"} minDate={new Date()}/>
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
            <input type="radio" id="private" name="privOrPublic"/>Private
            <input type="radio" id="public" name="privOrPublic"/>Public
            <br/><br/>
            <label htmlFor="people">Maximum Amount of People</label>
            <input type="number" id="people" min="1" onSubmit={(e) => {e.preventDefault()}}/>
            <br/><br/>
            <label htmlFor="startDay">Start Date</label>
            <input type="date" id="startDay" name="chooseDate" value={minDate} min={new Date().toISOString().split('T')[0]} onChange={handleChange}/>
            { minDate != "" &&
                <>
                    <label htmlFor="endDay" style={{marginLeft: "10px"}}>End Date</label>
                    <input type="date" id="endDay" name="chooseDate" value={maxDate} min={minDate} onChange={(e) => setMaxDate(e.target.value)}/>
                    <br/><br/>
                    <button id="submit" type="submit" value="Submit">Submit</button>
                </>
            }
        </form>
        <button onClick={(e) => {
            e.preventDefault()
            switchSelector(true)
        }} style={{marginLeft: "10px"}}>📅 graphical selector</button>
        </>
    )
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export default Form