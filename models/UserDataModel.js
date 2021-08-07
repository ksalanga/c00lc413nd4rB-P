import { MongoClient } from 'mongodb'
import { hash, compare } from 'bcrypt'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
if (!MONGODB_DB) throw new Error('Please define the MONGODB_DB environment variable inside .env.local')

const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

export default class UserDataModel {
    async findUser(username) {
      await client.connect()
      
      return await client.db(MONGODB_DB).collection('users').findOne({username: username})
    }

    async findEmail(email) {
      if (!client) this.connectToDatabase()

      return await users.findOne({email: email.toLowerCase()})
    }

    async createUser(form) {
      if (!client) this.connectToDatabase()

      const saltRounds = 10
      form['username'] = form['username'].toLowerCase()
      form['email'] = form['email'].toLowerCase()
      form['password'] = await hash(req.body['password'], saltRounds)

      return await users.insertOne(form)
    }

    async matchingPassword(username, password) {
      await client.connect()

      const hashPassword = await client.db(MONGODB_DB).collection('users').findOne({username: username})

      console.log(hashPassword)

      return await compare(password, hashPassword)
    }
}