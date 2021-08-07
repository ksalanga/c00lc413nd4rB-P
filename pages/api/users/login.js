import nextConnect from 'next-connect'
import passport from 'passport'
import Local from 'passport-local'
import UserDataModel from '../../../models/UserDataModel'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import flash from 'connect-flash'

const sessionCookie = 'calendar.sid'
const handler = nextConnect()
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

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

handler.post(passport.authenticate('local', {
    failureFlash: true 
}), (req, res) => {
    res.statusCode = 200
    res.json({'message': 'logged in'})
})

export default handler