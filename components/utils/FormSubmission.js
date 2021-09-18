import useSWR from "swr"
const fetcher = async (...args) => fetch(...args).then(r => r.json())

export default function FormSubmission(form) {

    // We only get the timeZone of the minimum first date.
    // Calculate timestamp by subtracting minDate from new Date(0).
    const timeStamp = (
        (new Date(formatDate(form.dates[0])).getTime() - new Date(0).getTime()) * .001
    ).toString()
    
    const { data, error } = 
    useSWR(`https://maps.googleapis.com/maps/api/timezone/json?location=${(form.latLng.lat).toString()}%2C${(form.latLng.lng).toString()}&timestamp=${timeStamp}&key=AIzaSyBZ5KkgolEdqXA-8_fErDEbCY-fgDIeA-M`, fetcher)

    return {
        timeZone: data,
        isLoading: !error && !data,
        isError: error
    }
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