import nextConnect from 'next-connect'
import { default as authenticationMiddleware } from '../../../middleware/authenticate'
import { default as passport, authenticate } from '../../../middleware/passport'

const handler = nextConnect()
handler.use(authenticationMiddleware)
handler.use(passport)

const auth = (req, res, next) => {
    console.log(req.session.cookie)
    if (req.isAuthenticated()) next()
    else res.status(400).json({'message': 'Not Authenticated.'})
}

handler.post((req, res) => {
    authenticate(req, res)
})

handler.get(auth, (req, res) => {
    res.status(200).end('OK')
})

handler.post()
export default handler