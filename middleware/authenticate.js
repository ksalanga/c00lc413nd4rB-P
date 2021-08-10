import nextConnect from 'next-connect'
import passport from 'passport'
import next from 'next'
import { default as localPassport } from './PassportLocal'

const handler = nextConnect()

passport.use(localPassport)

handler.use(passport.initialize())

export const passportAuthenticate = (req, res) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) return res.status(401).json(err)
        if (user) res.status(200).json({'message': 'logged in'})
        else res.status(401).json({'message': info.message})
    })(req, res, next)
}

export default handler