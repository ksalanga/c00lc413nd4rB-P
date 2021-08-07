import nextConnect from 'next-connect'
import passport from 'passport'
import Local from 'passport-local'
import UserDataModel from '../../../models/UserDataModel'

const handler = nextConnect()
const Users = new UserDataModel()

handler.use(passport.initialize())

passport.use(new Local.Strategy(
    (username, password, done) => {
        try {
            const userFound = Users.findUser(username)

            if (!userFound) return done(null, false, {message: 'No User'})

            console.log(username)
            
            const passwordFound = Users.matchingPassword(username, password)

            if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
            return done (null, userFound)
        } catch (e) {
            return done(e)
        }
    }
))

handler.post( passport.authenticate('local', { successRedirect: '/',
failureRedirect: '/login' }), (req, res) => {
    res.status(200).json({message: 'successfully logged in'})
})

export default handler