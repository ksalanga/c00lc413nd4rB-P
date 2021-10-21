import nc from 'next-connect'
import CalendarDataModel from '../../../models/CalendarDataModel'
import { Client } from '@googlemaps/google-maps-services-js'
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

async function timezoneIDProvider(address, timestamp) {
    const geoCodeResponse = await googleMapsClient
    .geocode({
        params: { 
            address: address,
            key: process.env.GOOGLE_MAPS_KEY 
        }
    })

    if (geoCodeResponse.data.status !== 'OK') {
        throw 'Invalid local Location request'
    }

    const localTimezoneGeocode = geoCodeResponse.data.results[0].geometry.location

    const timeZoneResponse = await googleMapsClient
    .timezone({
        params: { 
            location: localTimezoneGeocode,
            timestamp: timestamp,
            key: process.env.GOOGLE_MAPS_KEY 
        } //timestamp ought to be in seconds
    })

    const timeZoneData = timeZoneResponse.data

    if (timeZoneData.status !== 'OK') {
        throw 'Invalid local Location request (due to GeoCoding API)'
    }

    return timeZoneData.timeZoneId
}

async function createCalendarWithAPIKey(form) {
    const invalidFormatMessage = 
    `INVALID FORMATTING:
    Calendar Creation must have 10 Keys (case Sensitive):
    name (String)
    creator (String)
    decidedOrUndecided (JSON Object)
    privateOrPublic (String)
    maximumPeople (String)
    selectionExpirationDate (Date if Undecided, NULL if decided)
    dates (Array of dates)
    attendingUsers (array)
    address (JSON object)
    key (String)`

    if (contentType === undefined || contentType !== 'application/json') {
        throw 'Content Type must be application/json'
    }

    if (Object.keys(form).length !== 11) {
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
    || form['address'] === undefined
    || form['key'] === undefined) {
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
    || typeof(form['address']) !== 'object'
    || typeof(form['key']) !== 'string') {
        throw invalidFormatMessage
    }

    if (!isValidKey(form['key'])) {
        throw 'Invalid Key'
    }

    if (form['attendingUsers'].length !== 0) {
        throw 'attendingUsers must be an empty array to start'
    }
}

// TODO
async function isValidKey(key) {
    // Access Database
    // If a key exists, tag it to user.
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

function datesHandling(form) {
    // Format for Array of Dates: If every instance of that Object isn't a date, invalid.
    // If Date is Invalid, invalid
    for (var date in form['dates']) {
        if (!(date instanceof Date)) {
            throw `Dates array must have Date Objects only`
        } else if (isNaN(date.getTime())) {
            throw 'Invalid Date Format for a date in the dates Array'
        }
    }

    const rightNow = new Date()

    const datesGreaterThanToday = form['dates'].filter(date => date.getTime() >= rightNow.getTime())

    if (datesGreaterThanToday.length < 2) {
        throw 'dates array must have two dates minimum.'
    }

    datesGreaterThanToday.sort((a, b)=>{return a.getTime() - b.getTime()})

    // checks if Undecided first because if it's decided, then selectionExpirationDate will be null, if undecided is false, skips that && logic.
    if (decidedOrUndecided['undecided'] 
    && 
    (form['selectionExpirationDate'].getTime() > datesGreaterThanToday[0].getTime() // If the expiration Date is greater than the minimum date.
    || form['selectionExpirationDate'].getTime() < rightNow.getTime())
    ) {
        throw 'selectionExpirationDate must be less than the minimum selection Date and greater than Today'
    }
}

async function errorHandling(req, res) {
    const form = req.body

    try {
        createCalendarWithAPIKey(form)
        decidedOrUndecidedHandling(form)
        datesHandling(form)
    } catch (err) {
        throw err
    }
}

handler.use(session).post(async (req, res) => {
    try {
        if (req.session?.get('user') === undefined) {
            await errorHandling(req, res)
        }

        const timezoneID = await timezoneIDProvider(req.body['address']['name'], 
        req.body['dates'][0].getTime() * .001)

        req.body['address'] = {
            ...req.body['address'], 
            timezoneID: timezoneID
        }
        
        CDM.createCalendar(req.body)
    } catch (err) {
        res.status(400).end(err)
        return
    }
})