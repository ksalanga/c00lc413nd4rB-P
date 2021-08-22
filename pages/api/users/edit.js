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
    upload(req, res, (err) => {
        if (err) {
            res.status(406).send(err.message)
            return
        }

        if (!UDM.matchingPassword(req.body.user, req.body.passwordConfirm)) return res.status(406).send('Must have correct password')

        if (req.file !== undefined) {
            const fileName = req.body.id + '.' + req.file.mimetype.split('/')[1]
            const file = bucket.file(fileName)
            const blobStream = file.createWriteStream({resumable: false})

            // Store in Google Cloud Storage
            blobStream
            .on('finish', () => {
                const imageURL = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.name}`
                UDM.editProfilePicture(req.body.user, imageURL)
            })
            .on('error', (error) => {console.log(error)})
            .end(req.file.buffer)
        }

        res.status(200).send('OK')
    })
})

export default handler

export const config = {
    api: {
      bodyParser: false, // Disallow body parsing, consume as stream
    },
}