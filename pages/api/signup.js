import { hash } from "bcrypt"
import nextConnect from 'next-connect'
import middleware from '../../middleware/database.js'

const handler = nextConnect()

handler.use(middleware)

const errorHandling = (req, res) => {
    const requestSize = req.socket.bytesRead
    const sizeLimit = 10 ** 6 // 1MB
    if (requestSize > sizeLimit) {
        res.statusCode = 431
        throw 'request too large'
    }

    if (req.headers["content-type"] !== 'application/json') {
        res.statusCode = 400
        throw 'Bad request, please have it be of content type application/json'
    }

    if (Object.keys(req.body).length != 3) {
        res.statusCode = 400
        throw 'Must only be three values: username, email, and password'
    }

    if (req.body['username'] === undefined || req.body['password'] === undefined || req.body['email'] === undefined) {
        res.statusCode = 400
        throw 'Keys must be username, password, and email (case sensitive)'
    }

    const validateUserName = /^[a-z0-9]{3,16}$/.test(req.body['username'])
    const validateEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(req.body['email'])
    const validatePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(req.body['password'])

    if (!validateUserName || !validateEmail || !validatePassword) {
        res.statusCode = 400
        throw `Error formatting username, email, password. UserName correct: ${validateUserName}, Email correct: ${validateEmail}, Password correct: ${validatePassword}`
    }
}

handler.post(async (req, res) => {
    try {
        errorHandling(req, res)
    } catch (error) {
        res.json({'message' : error})
        return
    }

    // validate username, email, and password.


    let checkUser = await req.db.collection('users').findOne({username: req.body['username']})
    let checkEmail = await req.db.collection('users').findOne({email: req.body['email']})

    if (checkUser) {
        res.statusCode = 400
        res.json({'message': 'user already exists'})
        return
    }

    if (checkEmail) {
        res.statusCode = 400
        res.json({'message': 'email already exists'})
        return
    }

    // Hash Password
    const saltRounds = 10

    // insert empty calendars key
    req.body['calendars'] = null

    req.body['password'] = await hash(req.body['password'], saltRounds)

    await req.db.collection('users').insertOne(req.body)
    res.statusCode = 200
    res.json({'message': 'New User Created.'})
})

export default handler