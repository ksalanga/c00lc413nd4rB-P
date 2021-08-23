import multer from 'multer'
import { Storage } from '@google-cloud/storage'
import nextConnect from 'next-connect'
import UserDataModel from '../../../models/UserDataModel'

const UDM = new UserDataModel()
const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
})
const bucket = storage.bucket(process.env.GCS_BUCKET)

function onError(err, req, res, next) {
    console.log(err)
  
    res.status(500).end(err.toString())
    next()
}

const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") return cb(new Error('Incorrect File Type, must be PNG or JPEG'))

        return cb(null, true)
    },
    limits: {
        fileSize: 5 * (10**5) // 5 MB   
    }
}).single('image')

const handler = nextConnect({onError})

handler.post(async (req, res) => {
    const contentType = req.headers['content-type']

    if (contentType === undefined || !(contentType.includes('multipart/form-data'))) {
        console.log('must be multi man!')
        return res.status(400).send('Content Type must be multipart/form-data')
    }

    upload(req, res, async (err) => {
        if (err) {
            res.status(406).send(err.message)
            return
        }

        const form = req.body
        const undefinedSettings = (form['id'] === undefined 
        || form['user'] === undefined 
        || form['newUsername'] === undefined 
        || form['newPassword'] === undefined 
        || form['passwordConfirm'] === undefined)

        const improperFormat = typeof(form['id']) !== 'string'
        || typeof(form['user']) !== 'string'
        || typeof(form['newUsername']) !== 'string'
        || typeof(form['newPassword']) !== 'string'
        || typeof(form['passwordConfirm']) !== 'string'

        if (Object.keys(form).length !== 5 || undefinedSettings || improperFormat) {
            console.log('improper formatting')
            return res.status(400).send('Form body improperly formatted: must have properties: id, user, newUsername, newPassword, passwordConfirm (case sensitive. all strings)')
        }

        if (req.file !== undefined) {
            const fileName = form.id + '.' + req.file.mimetype.split('/')[1]
            const file = bucket.file(fileName)
            const blobStream = file.createWriteStream({resumable: false})

            // Store in Google Cloud Storage
            blobStream
            .on('finish', async () => {
                const imageURL = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.name}`
                await UDM.editProfilePicture(form.user, imageURL)
            })
            .on('error', (error) => {console.log(error)})
            .end(req.file.buffer)
        }

        // Correct username and password format
        const validateUserName = /^[a-z0-9]{3,16}$/.test(form.newUsername)
        const validatePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(form.newPassword)

        if (form.newUsername !== '' && !validateUserName) {
            console.log('UsernameFormatWrong!')
            return res.status(406).send('Username Format is incorrect')
        }

        if (form.newPassword !== '' && !validatePassword) {
            console.log('PasswordFormatWrong!')
            return res.status(406).send('Password Format is incorrect')
        }

        if (!(await UDM.matchingPassword(form.user, form.passwordConfirm))) {
            console.log('wrong password bud')
            return res.status(406).send('Must have correct password to edit username or password')
        }
        
        if (await UDM.findUser(form.newUsername.toLowerCase())) {
            console.log('username exists bud')
            return res.status(406).send('Username already exists')
        }

        const editSettings = (({newUsername, newPassword}) => ({newUsername, newPassword}))(form)
        await UDM.editProfile(form.user.toLowerCase(), editSettings)

        res.status(200).send('OK')
    })
})

export default handler

export const config = {
    api: {
      bodyParser: false, // Disallow body parsing, consume as stream
    },
}