import {useEffect, useState} from 'react'

function Form(props) {
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')

    function checkSubmission(e) {
        e.preventDefault()
        const submission = []
        var privOrPublic = document.getElementsByName('privOrPublic')

        privOrPublic.forEach((button) => {if (button.checked) submission.push(button.id)})
        submission.push(document.getElementById("people").value, document.getElementById("startDay").value, document.getElementById("endDay").value)
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
        <form>
            <input type="radio" id="private" name="privOrPublic"/>Private
            <input type="radio" id="public" name="privOrPublic"/>Public
            <br/><br/>
            <label htmlFor="people">Maximum Amount of People</label>
            <input type="number" id="people"/>
            <br/><br/>
            <label htmlFor="startDay">Start Date</label>
            <input type="date" id="startDay" name="chooseDate" min={new Date().toISOString().split('T')[0]} onChange={handleChange}/>
            { minDate != "" &&
                <>
                    <label htmlFor="endDay">End Date</label>
                    <input type="date" id="endDay" name="chooseDate" min={minDate} onChange={(e) => setMaxDate(e.target.value)}/>
                    <br/><br/>
                    <input id="submit" type="submit" value="Submit" onClick={checkSubmission}/>
                </>
            }
        </form>
    )
}

export default Form