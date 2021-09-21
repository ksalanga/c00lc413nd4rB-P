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
        && Object.prototype.toString.call(form['selectionExpirationDate']) !== '[object Null]')
    || Array.isArray(form['dates'])
    || Array.isArray(form['attendingUsers'])
    || typeof(form['address']) !== 'object') {
        throw invalidFormatMessage
    }

    // Format for decided must be { decided: null } or { undecided : { confirmed : false }}
    if (form['decidedOrUndecided']['undecided'] === undefined 
    && form['decidedOrUndecided']['undecided'] === undefined) {
        throw `decidedOrUndecided Key in a create Calendar Submission must be an Object that has a decided key or undecided key.
        If the key to the decidedOrUndecided key is decided, it must have value null ( as it requires no further information ),
        If the key to the decidedOrUndecided key is undecided, it must have a object { confirmed: false } as a value.
        ( this is required so that if it's undecided, when the user eventually decides that the merged dates are confirmed, 
        that confirmed key will be equal to true. )
        Example: { ...form, decidedOrUndecided: { decided: null } }
        OR { ...form, decidedOrUndecided: { undecided: { confirmed: false } } }`
    } else if (form['decidedOrUndecided']['decided']) {// then the creator of the calendar has used decided
        if (form['decidedOrUndecided']['decided'] !== null) {
            throw `If the Create Calendar Submission decidedOrUndecided value is of key decided, that key's value must be null:
            Ex: { ...form, decided: {decided: null} }`
        }
    } else {
        const incorrectUndecidedFormatMessage = 
        `If the Create Calendar Submission decidedOrUndecided value is of key undecided, that key's value must be the object:
        { confirmed: false }
        Ex: { ...form, decidedOrUndecided: { undecided: { confirmed: false } } }`

        if (form['decidedOrUndecided']['undecided']['confirmed'] === undefined) {
            throw incorrectUndecidedFormatMessage
        } else {
            if (form['decidedOrUndecided']['undecided']['confirmed'] !== false) {
                throw incorrectUndecidedFormatMessage
            }
        }
    }
    
    // Format for ExpirationDate. If isNaN(form['selectionExpirationDate'].getTime()) means not a valid date.
    if (isNaN(form['selectionExpirationDate'].getTime())) {
        throw `Invalid Date Format for key selectionExpiration Date`
    }

    // Format for Array of Dates: If every instance of that Object isn't a date, invalid.
    for (var date in form['dates']) {
        if (!(date instanceof Date)) {
            throw `Dates array must have Date Objects only`
        } else if (isNaN(date.getTime())){
            throw 'Invalid Date Format for a date in the Date Array'
        }
    }
    // Filter Through Dates and Return anything that is greater than or equal to today.
        // If it's undecided, must have length at least 2
        // Sort Dates, if there are dates before today, invalid

    // Format attendingUsers length must be 0
    if (form['attendingUsers'].length !== 0) {
        throw 'attendingUsers must be an empty array to start'
    }

    // Call the Google TimeZone and geocode APIs here rather than in the React Components.

    // If it's an invalid Address that's given or the geoCode responds with nothing, then the address doesn't exist

    // Format address:
        // must have:
        // name (string)

        // The rest we can call GoogleApis:
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