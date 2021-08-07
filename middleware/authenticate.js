import nextConnect from 'next-connect'
import passport from 'passport'
import Local from 'passport-local'
import UserDataModel from '../models/UserDataModel'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import flash from 'connect-flash'

const handler = nextConnect()
const sessionCookie = 'calendar.sid'
const Users = new UserDataModel()
const FileStore = sessionFileStore(session)

handler.use(session({
    store: new FileStore({ path: 'sessions' }),
    secret: 'some random thingy',
    resave: true,
    saveUninitialized: true, 
    name: sessionCookie
}))

handler.use(passport.initialize())
handler.use(passport.session())
handler.use(flash())

passport.use(new Local.Strategy(
    async (username, password, done) => {
        try {
            const userFound = await Users.findUser(username)

            if (!userFound) return done(null, false, {message: 'No User'})

            const passwordFound = await Users.matchingPassword(username, password)

            if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
            return done(null, userFound)
        } catch (e) {
            return done(e)
        }
    }
))

passport.serializeUser((user, done) => {
    try {
        done(null, user.username)
    } catch (e) { done(e) }
})
  
passport.deserializeUser(async (username, done) => {
    try {
        var user = await Users.findUser(username)
        done(null, user)
    } catch (e) { done(e) }
})

export default handler