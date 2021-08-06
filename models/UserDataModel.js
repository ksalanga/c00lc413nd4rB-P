import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    )
}
  
if (!MONGODB_DB) {
    throw new Error(
      'Please define the MONGODB_DB environment variable inside .env.local'
    )
}

const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

class UserDataModel {
    constructor() {
      connectToDatabase()
    }
  
    async connectToDatabase() {
      await client.connect()
    }

    async findUser(username) {
        return await client.db(MONGODB_DB).collection('users').findOne({username: username})
    }
}