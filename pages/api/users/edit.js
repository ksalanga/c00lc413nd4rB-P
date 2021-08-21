import multer from 'multer'
import { Bucket, Storage, File } from '@google-cloud/storage'
import nextConnect from 'next-connect'

function onError(err, req, res, next) {
    console.log(err)
  
    res.status(500).end(err.toString());
    next()
}

// Multer might not have fully parsed the req.body if the file is being used first. 
// Therefore, try to put the body first in formData so
// all of those values are handled with before the main file is dealt with.
const upload = multer({})

const handler = nextConnect({onError}).use(upload.single('image'))

handler.post(async (req, res) => {
    res.status(200).end('OK')
})

export default handler

export const config = {
    api: {
      bodyParser: false, // Disallow body parsing, consume as stream
    },
}