import { withIronSession } from 'next-iron-session'
import UserDataModel from '../../../models/UserDataModel'

async function handler(req, res) {
    const UDM = new UserDataModel()
    const username = await req.body.username.toLowerCase()
    const password = await req.body.password

    const userFound = await UDM.findUser(username)
    if (!userFound) {
        res.status(401).send('No User Found')
        return
    }

    const passwordFound = await UDM.matchingPassword(username, password)
    if (!passwordFound) {
        res.status(401).send('Incorrect Password')
        return
    }

    req.session.set('user', {
        id: userFound['_id'].toString(),
        username: userFound['username'],
        profilePicture: userFound['profilePicture']
    })

    await req.session.save()
    res.status(200).send('Logged in')
}

export default withIronSession(handler, {
    password: process.env.ironSessionPassword,
    cookieName: "calendar.sid",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
})