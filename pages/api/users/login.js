import nextConnect from 'next-connect'
import { default as authenticate, passportAuthenticate } from '../../../middleware/authenticate'

const handler = nextConnect()
handler.use(authenticate)

const auth = (req, res, next) => {
    if (req.isAuthenticated()) next()
    else res.status(400).json({'message': 'Not Authenticated.'})
}

handler.post((req, res) => {
    passportAuthenticate(req, res)
})

handler.get(auth, (req, res) => {
    res.status(200).end('OK')
})

handler.post()
export default handler