import { connectToDatabase } from '../util/mongodb.js'
import SignupForm from '../components/SignupForm.js'

export default function Signup({ users }) { 
    return (
        <>
        <ul>
        {users.map((user, i) => (
          <li key={i}>
            <h2>{user.name}</h2>
            <h3>{user.email}</h3>
          </li>
        ))}
      </ul>
        <h1>Hi</h1>
        <SignupForm />
        </>
    )
}

export async function getServerSideProps() {
    const { db } = await connectToDatabase()

    const users = await db.collection('users').find({}).toArray()

    return {
        props: {
            users: JSON.parse(JSON.stringify(users))
        },
    }
}