import passport from 'passport'
import { Strategy } from 'passport-local'
import nextConnect from 'next-connect'
import { middleware as dbConnect } from './database.js'
import { compare } from 'bcrypt'

const middleware = nextConnect()

// Express Session 

middleware.use(passport.initialize())
middleware.use(dbConnect)
// middleware.use(passport.session())

const LocalStrategy = Strategy

const authenticate = (handler) => {
    return async (req, res) => {
        const db = req.db

        passport.use(new LocalStrategy(
            async (username, password, done) => {
                try {
                    const userFound = await db.findOne({username: username})

                    if (!userFound) return done(null, false, {message: 'No User'})
                    
                    const hash = userFound.password

                    const passwordFound = await compare(password, hash)

                    if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
                    return done (null, userFound)
                } catch (e) {
                    return done(e)
                }
            }
        ))

        passport.authenticate('local',  {
            successRedirect: '/',
            failureRedirect: 'login',
        })

        return handler(req, res)
    }
}

export default authenticate