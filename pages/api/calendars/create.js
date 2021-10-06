import nc from 'next-connect'
import { Client } from '@googlemaps/google-maps-services-js'
import CalendarDataModel from '../../../models/CalendarDataModel'
import { ironSession } from 'next-iron-session'

const handler = nc()
const googleMapsClient = new Client()
const CDM = new CalendarDataModel()

const session = ironSession({
    password: process.env.ironSessionPassword,
    cookieName: "calendar.sid",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    }
})

async function addressTimezoneProvider(address, timestamp) {
    // get the geoCode of the location
    const geoCodeResponse = await googleMapsClient
    .geocode({
        params: { address: address,
        key: process.env.GOOGLE_MAPS_KEY }
    })

    if (geoCodeResponse.data.status !== 'OK') {
        throw 'Invalid local Location request'
    }

    const localLocationGeocode = geoCodeResponse.data.results[0].geometry.location

    // get the TimeZone Offset of the user's local location
    const timeZoneResponse = await googleMapsClient
    .timezone({
        params: { location: localLocationGeocode,
        timestamp: timestamp,
        key: process.env.GOOGLE_MAPS_KEY } //timestamp ought to be in seconds
    })

    const timeZoneData = timeZoneResponse.data

    if (timeZoneData.status !== 'OK') {
        throw 'Invalid local Location request (due to GeoCoding API)'
    }

    return timeZoneData
}

async function formatHandling(form) {
    const invalidFormatMessage = 
    `INVALID FORMATTING:
    Calendar Creation must have 10 Keys (case Sensitive):
    name (String)
    creator (String)
    localLocation (String)
    decidedOrUndecided (JSON Object)
    privateOrPublic (String)
    maximumPeople (String)
    selectionExpirationDate (Date if Undecided, NULL if decided)
    dates (Array of dates)
    attendingUsers (array)
    address (JSON object)`

    if (contentType === undefined || contentType !== 'application/json') {
        throw 'Content Type must be application/json'
    }

    if (Object.keys(form).length !== 10) {
        throw invalidFormatMessage
    }

    if (form['name'] === undefined
    || form['creator'] === undefined
    || form['localLocation'] === undefined
    || form['decidedOrUndecided'] === undefined
    || form['privateOrPublic'] === undefined
    || form['maximumPeople'] === undefined
    || form['selectionExpirationDate'] === undefined
    || form['dates'] === undefined
    || form['attendingUsers'] === undefined
    || form['address'] === undefined) {
        throw invalidFormatMessage
    }
    
    // Incorrect Types for keys
    if (typeof(form['name']) !== 'string'
    || typeof(form['creator']) !== 'string'
    || typeof(form['localLocation']) !== 'string'
    || typeof(form['decidedOrUndecided']) !== 'object'
    || typeof(form['privateOrPublic']) !== 'string'
    || typeof(form['maximumPeople']) !== 'string'
    || (!(form['selectionExpirationDate'] instanceof Date)
        && form['selectionExpirationDate'] !== null)
    || Array.isArray(form['dates'])
    || Array.isArray(form['attendingUsers'])
    || typeof(form['address']) !== 'object') {
        throw invalidFormatMessage
    }
}

async function localTimeZoneHandling(form) {
    try {
        const today = new Date()
        const localTimezoneData = await addressTimezoneProvider(form['localLocation'], today.getTime() * .001)
        
        // append localTimezoneData to form['localLocation']
        form['localLocation'] = {
            name: form['localLocation'],
            geocode: localLocationGeocode,
            timestamp: today.getTime() * .001,
            ...localTimezoneData
        }
    
        // We shift the today's UTC hours by the timeZone shift of the user's local timeZone.
        const timeShift = (localTimezoneData.dstOffset / (3600)) + (localTimezoneData.rawOffset / (3600))
        today.setHours(today.getHours() + timeShift)
    
        // this const returns the Local Today at 12AM which will be used as the lower limit for filtering dates less than the local "today"
        // How? First:
        // It should be a UTC date, and if the day, month, and/or year has changed, it has been accounted for because of the time Zone Hour Shift
        // Now, we just add the Hour value to the UTC date as opposite of the timeShift and zero any lower units
        // so that we are at 12AM of what the localUser perceives as today
        const todayInLocalTime = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), (timeShift * -1)))
        
        // In theory, if a user inputs a date in the dates array that is considered today at 12AM in their local time, 
        // but that time is technically behind the current getTime(),
        // the server won't cut off that day.
    
        // One question: timeZone changes, how does this play into the LocalTime, might it go backwards in time and be a day behind at 12AM with all these shifts?
        // Even if a timeZone Changes mid request, the inconsistent hours shouldn't be a problem. 
        // proof:
        // If the stale time is greater than the real timeShift by X, the actual time has Shifted by X * -1,
        // So even if realTimeShift - staleTimeShift = -X, the Time itself has moved forward by +X (That's just how timezones work).
        // so the net change remains 0, and we still land at 12AM of that day.
        // therefore, a shift in TimeZone won't cause a day change even with stale values.
    
        return { 
            today: today,
            todayInLocalTime: todayInLocalTime,
            timeShift: timeShift
        }
    } catch (err) {
        throw error
    }

}

function decidedOrUndecidedHandling(form) {
    const decidedOrUndecided = form['decidedOrUndecided']
    // Format for decided must be { decided: null } or { undecided : { confirmed : false }}
    if (decidedOrUndecided['undecided'] === undefined 
    && decidedOrUndecided['undecided'] === undefined) {
        throw `decidedOrUndecided Key in a create Calendar Submission must be an Object that has a decided key or undecided key.
        If the key to the decidedOrUndecided key is decided, it must have value null ( as it requires no further information ),
        If the key to the decidedOrUndecided key is undecided, it must have a object { confirmed: false } as a value.
        ( this is required so that if it's undecided, when the user eventually decides that the merged dates are confirmed, 
        that confirmed key will be equal to true. )
        Example: { ...form, decidedOrUndecided: { decided: null } }
        OR { ...form, decidedOrUndecided: { undecided: { confirmed: false } } }`
    } else if (decidedOrUndecided['decided']) {// then the creator of the calendar has used decided
        if (decidedOrUndecided['decided'] !== null) {
            throw `If the Create Calendar Submission decidedOrUndecided value is of key decided, that key's value must be null:
            Ex: { ...form, decided: {decided: null} }`
        }
    } else {
        const incorrectUndecidedFormatMessage = 
        `If the Create Calendar Submission decidedOrUndecided value is of key undecided, that key's value must be the object:
        { confirmed: false }
        Ex: { ...form, decidedOrUndecided: { undecided: { confirmed: false } } }`

        if (decidedOrUndecided['undecided']['confirmed'] === undefined) {
            throw incorrectUndecidedFormatMessage
        } else {
            if (decidedOrUndecided['undecided']['confirmed'] !== false) {
                throw incorrectUndecidedFormatMessage
            }
        }
    }
    
    if (decidedOrUndecided['decided'] && form['selectionExpirationDate'] !== null) {
        throw 'If the calendar is decided, the form\'s selectionExpirationDate value must be null'
    } else if (decidedOrUndecided['undecided'] && !(form['selectionExpirationDate'] instanceof Date)) {
        throw 'If the calendar is undecided, the form\'s selectionExpirationDate value must be a Date type'
    } else if (isNaN(form['selectionExpirationDate'].getTime())) {
        throw 'If the calendar is undecided, the form\'s selectionExpirationDate value must be a valid Date'
    }
}

function datesHandling(form, today, todayInLocalTime, timeShift) {
    // Format for Array of Dates: If every instance of that Object isn't a date, invalid.
    // If Date is Invalid, invalid
    for (var date in form['dates']) {
        if (!(date instanceof Date)) {
            throw `Dates array must have Date Objects only`
        } else if (isNaN(date.getTime())) {
            throw 'Invalid Date Format for a date in the dates Array'
        }
    }

    if (form['decidedOrUndecided']['decided']) { // Since Decided includes today, the todayInLocalTime at 12AM variable is used.
        var datesGreaterThanMinDate = form['dates'].filter(date => date.getTime() >= todayInLocalTime.getTime())
    } else { // For undecided, minimum Date must be at least 23 hours ahead of right now in time.
        today.setHours(today.getHours() - timeShift)
        today.setHours(today.getHours() + 23)
        var datesGreaterThanMinDate = form['dates'].filter(date => date.getTime() >= today.getTime())
    }

    if (datesGreaterThanMinDate.length === 0) {
        throw 'Must have at least One Date in the Dates Array (Two if it\'s an undecided Calendar)'
    }

    if (datesGreaterThanMinDate.length < 2 && decidedOrUndecided['undecided']) {
        throw 'An Undecided Calendar must have at least valid 2 dates in the dates array'
    }
    datesGreaterThanMinDate.sort((a, b)=>{return a.getTime() - b.getTime()})

    // checks if Undecided first because if it's decided, then selectionExpirationDate will be null, if undecided is false, skips that && logic.
    if (decidedOrUndecided['undecided'] 
    && (form['selectionExpirationDate'].getTime() > datesGreaterThanMinDate[0].getTime() // If the expiration Date is greater than the minimum date.
    || form['selectionExpirationDate'].getTime() < (today.getTime()))) { // If the expiration Date is less than right now + 23 hours.
        throw 'selectionExpirationDate must be less than the Minimum selection Date and greater than Today by at least 23 hours'
    }
}

async function eventTimeZoneHandling(form) {
    // form['address']['name'], form['dates'][0].getTime() * .001 
    if (form['address']['name'] === undefined || Object.keys(form['address']).length !== 1) {
        throw `address key must have one value and it should be an object:
        {name: name of event}`
    }

    try {
        const eventTimeZoneData = addressTimezoneProvider(form['address']['name'], form['dates'][0].getTime() * .001)
        
        if (eventTimeZoneData.status !== 'OK') {
            throw 'Invalid local Location request (due to GeoCoding API)'
        }
    
        // append to eventAddress
        form['address'] = {eventTimeZoneData, ...form['address']}
    } catch (err) {
        throw err
    }
    // If it's undecided we wait for a confirmtion and then call the eventGeocodingAndTimeZone Handling,

    // for now though, on create Calendar we only add this field for a decided event and input the time stamp as the first date
    // and naively make it the time of the earliest date, but later we're going to add a start and end time key, so use start time.

    // Format address:
        // must have:
        // name (string)

        // The rest we can call GoogleApis and addonto the address object later:
        // geoCode (Object)
            // lat (Float)
            // lng (Float)
        // TimeZoneAPI:
        // timeZoneName
        // timeZoneId
        // rawOffset
        // dstOffset
}

async function errorHandling(req, res) {
    const form = req.body

    try {
        formatHandling(form)
        const { today, todayInLocalTime, timeShift } = await localTimeZoneHandling(form)
        decidedOrUndecidedHandling(form)
        datesHandling(form, today, todayInLocalTime, timeShift)
        if (form['attendingUsers'].length !== 0) {
            throw 'attendingUsers must be an empty array to start'
        }
        
        // THE ADDRESSTIMEZONE PROVIDER TIMESTAMP FOR EVENTIMEZONE IS WRONG. CHANGE THAT LATER TO TIMESTAMP BASED ON THE "BEGIN TIME OF THE EARLIEST DATE".
        // NOT JUST SIMPLY THE EARLIEST DATE BECAUSE THE EARLIEST DATE ISNT NECESSARILY FORMATTED TO BE THE BEGIN TIME
        await eventTimeZoneHandling(form)
    } catch (err) {
        throw err
    }
}

handler.use(session).post(async (req, res) => {
    try {
        await errorHandling(req, res)
    } catch (err) {
        res.status(400).end(err)
        return
    }
})