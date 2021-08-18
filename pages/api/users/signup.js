import nextConnect from 'next-connect'
import UserDataModel from '../../../models/UserDataModel'

const handler = nextConnect()
const Users = new UserDataModel()

const errorHandling = async (req, res) => {
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
        throw `Format Error: Username ${validateUserName ? '✔️': '❌'},
         Email ${validateEmail ? '✔️' : '❌'}, 
         Password ${validatePassword ? '✔️' : '❌'}`
    }

    let checkUser = await Users.findUser(req.body.username)
    let checkEmail = await Users.findEmail(req.body.email)

    if (checkUser) {
        res.statusCode = 400
        throw 'Username already exists.'
    }

    if (checkEmail) {
        res.statusCode = 400
        throw 'Email already exists.'
    }
}

handler.post(async (req, res) => {
    try {
        await errorHandling(req, res)
        await Users.createUser(req.body)
        res.status(200).end('New User Created.')
    } catch(error) {
        res.end(error)
        return
    }
})

export default handler