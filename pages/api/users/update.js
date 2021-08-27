import { withIronSession } from "next-iron-session"
import UserDataModel from '../../../models/UserDataModel'

async function handler(req, res) {
    if (req.session === undefined || req.session === null) return res.status(400).send('no session exists')

    const UDM = new UserDataModel()

    const username = JSON.parse(req.body)['username']
    if (username === undefined || username === null) return res.status(400).send('username in body field required')

    const userFound = await UDM.findUser(username)

    if (!userFound) return res.status(400).send('no User exists')

    req.session.set('user', {...req.session.get('user'), username: userFound.username, profilePicture: userFound.profilePicture})
    
    await req.session.save()

    return res.status(200).send('Updated')
}

export default withIronSession(handler, {
    password: process.env.ironSessionPassword,
    cookieName: "calendar.sid",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
})