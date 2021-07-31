import { MongoClient } from 'mongodb'
import nextConnect from 'next-connect'

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

async function database(req, res, next) {
  await client.connect()
  req.dbClient = client
  req.db = client.db(MONGODB_DB)
  return next()
}

const middleware = nextConnect()
middleware.use(database)

export default middleware