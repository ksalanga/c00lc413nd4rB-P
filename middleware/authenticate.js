import nextConnect from 'next-connect'
import session from 'express-session'
import MongoStore from 'connect-mongo'
export const sessionCookie = 'calendar.sid'
const dayExpiration = 8.6 * (10**7) // one day in miliseconds

const handler = nextConnect()

handler.use(session({
    store: new MongoStore({ mongoUrl: process.env.MONGODB_URI}),
    secret: 'some random thingy',
    resave: false,
    saveUninitialized: false,
    name: sessionCookie,
    cookie: { maxAge: dayExpiration,
    secure: process.env.NODE_ENV === "development" ? false : true,
    httpOnly: false
}
}))

export const checkAuthentication = (req, res, next) => {
    if (req.session?.passport?.user) next()
    else res.status(400).send(JSON.stringify({'message': 'Not Authenticated.'}))
}

export default handler