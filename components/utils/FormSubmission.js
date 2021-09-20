import useSWR from "swr"
const fetcher = async (user, form, decided, ...args) => {
    fetch(...args) // first fetches timeZone API
    .then(r => r.json())
    .then(data => {
        const decidedOrUndecided = decided ? {decided: null} : {undecided: {confirmed: false}}
        const submission = {...form,
            creator: user.id, 
            attendingUsers: [], 
            decided: decidedOrUndecided,
            address: {...form.address, 
                timeZoneName: data.timeZoneName,
                timeZoneId: data.timeZoneId,
                rawOffset: data.rawOffset,
                dstOffset: data.dstOffset,
            }
        }
        return fetch('/api/calendars/create', { // then we make a post to calendars create
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submission)
        })
    })
    .then(r => r.json())
}

export default async function FormSubmission(user, form, decided) {
    // We only get the timeZone of the minimum first date.
    // Calculate timestamp by subtracting minDate from new Date(0).
    const lat = form.address.geoCode?.lat
    const lng = form.address.geoCode?.lng
    const timeStamp = (
        (new Date(formatDate(form.dates[0])).getTime() - new Date(0).getTime()) * .001
    ).toString()

    const { data, error } = 
    useSWR(`https://maps.googleapis.com/maps/api/timezone/json?location=${(lat).toString()}%2C${(lng).toString()}&timestamp=${timeStamp}&key=AIzaSyBZ5KkgolEdqXA-8_fErDEbCY-fgDIeA-M`, fetcher)
    
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