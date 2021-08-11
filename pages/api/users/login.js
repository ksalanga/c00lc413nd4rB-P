import nextConnect from 'next-connect'
import { default as authenticationMiddleware } from '../../../middleware/authenticate'
import { default as passport, authenticate } from '../../../middleware/passport'

const handler = nextConnect()
handler.use(authenticationMiddleware)
handler.use(passport)

handler.post((req, res) => {
    authenticate(req, res)
})

export default handler