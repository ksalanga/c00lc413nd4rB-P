// Express Session
// Session Storage (Can implement Mongo Store later)
// Passport for Sessions and Cookies

import nextConnect from 'next-connect'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { default as dbConnect } from '../../../middleware/database.js'
import { compare } from 'bcrypt'


const handler = nextConnect()
handler.use(passport.initialize())
handler.use(dbConnect)

const LocalStrategy = Strategy


handler.post((req, res) => {
    const db = req.db

    passport.authenticate('local',  {
        successRedirect: '/',
        failureRedirect: 'login',
    })

    passport.use(new LocalStrategy(
        (username, password, done) => {
            try {
                console.log('run?')
                const userFound = db.findOne({username: username})

                if (!userFound) return done(null, false, {message: 'No User'})
                
                const hash = userFound.password

                const passwordFound = compare(password, hash)

                if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
                return done (null, userFound)
            } catch (e) {
                return done(e)
            }
        }
    ))

    res.status(200).json({message: 'successfully logged in'})
})

export default handler