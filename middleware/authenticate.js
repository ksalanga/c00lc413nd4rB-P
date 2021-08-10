import nextConnect from 'next-connect'
import session from 'express-session'
import MongoStore from 'connect-mongo'
export const sessionCookie = 'calendar.sid'

const handler = nextConnect()

handler.use(session({
    store: new MongoStore({ mongoUrl: process.env.MONGODB_URI}),
    secret: 'some random thingy',
    resave: true,
    saveUninitialized: true, 
    name: sessionCookie
}))

export default handler