import nextConnect from "next-connect"
const handler = nextConnect()
import UserDataModel from '../../../models/UserDataModel'

const UDM = new UserDataModel()

handler.post(async (req, res) => {

    // Also have to delete user on our cloud service.
    const contentType = req.headers['content-type']

    if (contentType === undefined || contentType !== 'application/json') return res.status(400).send('Content Type must be application/json')
    const user = req.body['user']
    const password = req.body['password']

    if (user === undefined) return res.status(406).send('user field undefined')
    if (password === undefined) return res.status(406).send('password field undefined')
    if (Object.keys(req.body).length !== 2) return res.status(406).send('too little or too many properties. one password property only')

    if (!(await UDM.matchingPassword(user, password))) return res.status(406).send('Incorrect Password')

    if ((await UDM.deleteUser(user)).deletedCount) return res.status(200).send('User deleted')
    
    return res.status(404).send('user no longer exists')
})

export default handler