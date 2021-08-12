import nextConnect from 'next-connect'
import next from 'next'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import UserDataModel from '../models/UserDataModel'

const Users = new UserDataModel()
const handler = nextConnect()

handler.use(passport.initialize())
handler.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user.username)
})

passport.deserializeUser(async (username, done) => {
    var user = await Users.findUser(username)
    done(null, user)
})

passport.use(new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
        try {
            const userFound = await Users.findUser(username)

            if (!userFound) return done(null, false, {message: 'User does not exist'})

            const passwordFound = await Users.matchingPassword(username, password)

            if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
            return done(null, userFound)
        } catch (e) {
            return done(e)
        }
    }
))

export const authenticate = (req, res) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            req.logOut()
            return res.status(401).json(err)
        }
        if (user) {
            req.logIn(user, (err) => { if (err) return next(err) })
            res.status(200).json({'message': 'logged in'})
        }
        else {
            req.logOut()
            res.status(401).json({'message': info.message})
        }
    })(req, res, next)
}

export default handler