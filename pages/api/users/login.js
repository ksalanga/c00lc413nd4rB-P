import nextConnect from 'next-connect'
import passport from 'passport'
import { default as authenticate } from '../../../middleware/authenticate'

const handler = nextConnect()
handler.use(authenticate)

// Login Pop Up Message,
// Either through failureFlash or statusCode 400 with a given message.
// React Router? or set up a gateway server and/or reverse proxy that deals with what's handled
handler.post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
}))
// , (req, res) => {
//     res.statusCode = 200
//     res.json({'message': 'logged in'})
// })

export default handler