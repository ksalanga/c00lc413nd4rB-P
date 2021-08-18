import { ironSession } from 'next-iron-session'

export default ironSession({
    password: process.env.ironSessionPassword,
    cookieName: 'calendar.sid',
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
})