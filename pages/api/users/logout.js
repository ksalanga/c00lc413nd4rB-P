import nextConnect from 'next-connect'
import {default as authenticateMiddleware, sessionCookie} from '../../../middleware/authenticate'

const handler = nextConnect()
handler.use(authenticateMiddleware)

handler.get(async (req, res) => {
    await req.session.destroy()
    await req.logOut()
    // Setting Header deletes cookie on the client side
    res.setHeader('Set-Cookie', `${sessionCookie}=${req.cookies[sessionCookie]}; Path=/; HttpOnly; max-age=0;`)
    res.status(200).end(JSON.stringify({'message' : 'logged out'}))
})

export default handler