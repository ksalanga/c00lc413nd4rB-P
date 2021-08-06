

import nextConnect from 'next-connect'
import passport from 'passport'
import Local from 'passport-local'
import { default as dbConnect } from '../../../middleware/database.js'
import { compare } from 'bcrypt'


const handler = nextConnect()

handler.use(passport.initialize())
handler.use(dbConnect)

handler.post(async (req, res) => {
    const db = req.db

    passport.use(new Local.Strategy(
        function (username, password, done) {
            try {
                console.log('local')
                const userFound = db.collection('users').findOne({username: username})
    
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

    await passport.authenticate('local',  {
        session: false
    }, function (error, token) {
        console.log('auth')
        if (error) {
            console.log(error)
        } else {
            console.log(token)
        }
    })

    res.status(200).json({message: 'successfully logged in'})
})

export default handler