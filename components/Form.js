import React, {useState} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function Form(props) {
    const [minDate, setMinDate] = useState("")
    const [maxDate, setMaxDate] = useState("")
    const [privOrPublic, setPrivOrPublic] = useState([false, false])
    const [maxPeople, setMaxPeople] = useState("")
    const [graphicSelector, switchSelector] = useState(false)

    function checkSubmission() {
        if (maxPeople === "" || minDate === "" || maxDate === "" || !privOrPublic.includes(true)) return

        var submission = []

        submission.push(privOrPublic[0] ? "private" : "public")
        submission.push(maxPeople, minDate, maxDate)

        props.submit(submission)
        props.next()
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

    const handleClick = e => {
        e.target.id === "private" ? setPrivOrPublic([true, false]) : setPrivOrPublic([false, true])
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
            <input type="radio" id="private" name="privOrPublic" onChange={handleClick} checked={privOrPublic[0]}/>Private
            <input type="radio" id="public" name="privOrPublic" onChange={handleClick} checked={privOrPublic[1]}/>Public
            <br/><br/>
            <label htmlFor="people">Maximum Amount of People</label>
            <input type="number" id="people" min="1" max="300" onChange={e => setMaxPeople(e.target.value)} onSubmit={(e) => {e.preventDefault()}} value={maxPeople}/>
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