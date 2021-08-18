import { withIronSession } from 'next-iron-session'

function handler(req, res, session) {
    req.session?.destroy()
    res.send('Logged out')
}

export default withIronSession(handler, {
    password: process.env.ironSessionPassword,
    cookieName: 'calendar.sid',
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
})