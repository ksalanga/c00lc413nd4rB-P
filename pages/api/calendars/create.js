import nc from 'next-connect'
import {Client} from '@googlemaps/google-maps-services-js'
import CalendarDataModel from '../../../models/CalendarDataModel'

const handler = nc()
const client = new Client()

async function errorHandling(req, res) {
    const form = req.body

    const invalidFormatMessage = 
    `Calendar Creation must have 9 Keys (case Sensitive):
    name (String),
    creator (String)
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

    if (Object.keys((form)).length !== 9) {
        res.statusCode = 400
        throw invalidFormatMessage
    }

    if (form['name'] === undefined
    || form['creator'] === undefined
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

    // Format for Array of Dates: If every instance of that Object isn't a date, invalid.
    // If Date is Invalid, invalid
    for (var date in form['dates']) {
        if (!(date instanceof Date)) {
            throw `Dates array must have Date Objects only`
        } else if (isNaN(date.getTime())){
            throw 'Invalid Date Format for a date in the dates Array'
        }
    }

    // Mental Note for later: think about how changes in timeZone across the dates array will affect our filtering and error handling.

    // Array of Date Values that are greater than or equal to today.
    // just compare Month, Date, and Year rather than time.
    // Must Standardize Today though to the actual Today of the Local TimeZone. Might be the 10th in Server's Date but the 9th in the User's Date.
    // So a date in the 9th, which they added as a date, should have been accounted for.
    // We've to ask the TimeZone.
    const datesGreaterThanToday = form['dates'].filter(date => date.getTime() >= new Date().getTime())
    // Revise THIS METHOD ^^^^, but filter in general.

    if (datesGreaterThanToday.length === 0) {
        throw 'Must have at least One Date in the Dates Array (Two if it\'s an undecided Calendar)'
    }

    if (datesGreaterThanToday.length < 2 && decidedOrUndecided['undecided']) {
        throw 'An Undecided Calendar must have at least valid 2 dates in the dates array'
    }
    datesGreaterThanToday.sort((a, b)=>{return a.getTime() - b.getTime()})

    // Anything with new Date() aka. Today requires tweaking because the time isn't 0'ed in hours, mins, seconds, and it isn't 12 am of the user's local comp.
    // checks if Undecided first because if it's decided, then selectionExpirationDate will be null, if undecided is false, skips that && logic.
    if (decidedOrUndecided['undecided'] 
    && (form['selectionExpirationDate'].getTime() > datesGreaterThanToday[0].getTime()
    || form['selectionExpirationDate'].getTime() < new Date().getTime())) {
        throw 'selectionExpirationDate must be less than the Minimum selection Date and greater than Today'
    }
    
    // Format attendingUsers length must be 0
    if (form['attendingUsers'].length !== 0) {
        throw 'attendingUsers must be an empty array to start'
    }

    // Call the Google TimeZone and geocode APIs here rather than in the React Components.

    // If it's an invalid Address that's given or the geoCode responds with nothing, then the address doesn't exist

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

handler.post(async (req, res) => {
    try {
        await errorHandling(req, res)
    } catch (err) {
        res.end(err)
        return
    }
})