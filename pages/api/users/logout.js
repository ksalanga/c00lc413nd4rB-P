import nextConnect from 'next-connect'
import {default as authenticateMiddleware, sessionCookie} from '../../../middleware/authenticate'
import cookie from 'cookie'

const handler = nextConnect()
handler.use(authenticateMiddleware)

handler.get((req, res) => {
    req.session.cookie.expires = "Thu, Jan 01 1970 00:00:00 UTC"
    req.session.destroy()
    req.logOut()
    // res.setHeader('Set-Cookie', cookie.serialize(sessionCookie, req.cookies.sessionCookie, { expires: "Thu, Jan 01 1970 00:00:00 UTC"}))
    res.status(200).json({'message' : 'logged out'})
})

export default handler