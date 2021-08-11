import nextConnect from 'next-connect'
import session from 'express-session'
import MongoStore from 'connect-mongo'
export const sessionCookie = 'calendar.sid'
const dayExpiration = 8.6 * (10**7) // one day in miliseconds

const handler = nextConnect()

handler.use(session({
    store: new MongoStore({ mongoUrl: process.env.MONGODB_URI}),
    secret: 'some random thingy',
    resave: true,
    saveUninitialized: true,
    name: sessionCookie,
    cookie: { maxAge: dayExpiration }
}))

export const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) next()
    else res.status(400).json({'message': 'Not Authenticated.'})
}

export default handler