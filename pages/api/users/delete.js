import nextConnect from "next-connect"
const handler = nextConnect()
import UserDataModel from '../../../models/UserDataModel'
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
})
const bucket = storage.bucket(process.env.GCS_BUCKET)
const UDM = new UserDataModel()

handler.post(async (req, res) => {
    const contentType = req.headers['content-type']

    if (contentType === undefined || contentType !== 'application/json') return res.status(400).send('Content Type must be application/json')
    const id = req.body['id']
    const user = req.body['user']
    const password = req.body['password']

    if (id === undefined) return res.status(406).send('id field undefined')
    if (user === undefined) return res.status(406).send('user field undefined')
    if (password === undefined) return res.status(406).send('password field undefined')
    if (Object.keys(req.body).length !== 3) return res.status(406).send('too little or too many properties. one password property only')

    if (!(await UDM.matchingPassword(user, password))) return res.status(406).send('Incorrect Password')

    if ((await UDM.deleteUser(user)).deletedCount) {
        const files = ['jpeg', 'png']
        for (let ext in files) {
            await bucket.file(id + '.' + ext).delete({ignoreNotFound: true})
        }
        return res.status(200).send('User deleted')
    }

    return res.status(404).send('user no longer exists')
})

export default handler