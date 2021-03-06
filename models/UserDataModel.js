import { MongoClient, ObjectId } from 'mongodb'
import { hash, compare } from 'bcrypt'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
if (!MONGODB_DB) throw new Error('Please define the MONGODB_DB environment variable inside .env.local')

const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const users = client.db(MONGODB_DB).collection('users')

export default class UserDataModel {
    async findUser(username) {
      await client.connect()
      
      return await users.findOne({username: username})
    }

    async findEmail(email) {
      await client.connect()

      return await users.findOne({email: email.toLowerCase()})
    }

    async createUser(form) {
      await client.connect()

      const saltRounds = 10
      form['username'] = form['username'].toLowerCase()
      form['email'] = form['email'].toLowerCase()
      form['password'] = await hash(form['password'], saltRounds)
      form['calendars'] = null
      form['profilePicture'] = null

      return await users.insertOne(form)
    }

    async matchingPassword(username, password) {
      try {
          await client.connect()

          const user = await users.findOne({username: username})

          if (!user) return false

          const hashPassword = user.password

          return await compare(password, hashPassword)
      } catch (e) {
          console.log(e)
      }
    }

    async editProfile(username, form) {
      try {
        const updatedUser = {}
        await client.connect()

        if (form['newUsername'] !== '') updatedUser['username'] = form['newUsername']
        if (form['newPassword'] !== '') {
          const saltRounds = 10
          updatedUser['password'] = await hash(form['newPassword'], saltRounds)
        }

        return await users.updateOne({username: username}, {$set : updatedUser})
      } catch (e) {
        console.log(e)
      }
    }

    async editProfilePicture(id, url) {
      try {
        await client.connect()

        return await users.updateOne({_id: ObjectId(id)}, {$set : {'profilePicture' : url}})
      } catch (e) {
        console.log(e)
      }
    }

    async deleteUser(username) {
      try {
        await client.connect()

        return await users.deleteOne({username: username})
      } catch (e) {
        console.log(e)
      }
    }
}