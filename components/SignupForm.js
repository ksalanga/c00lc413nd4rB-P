import { useState } from 'react'
import { connectToDatabase } from '../util/mongodb'
import { genSalt, hash } from 'bcrypt'

const saltRounds = 20

export default function SignupForm() {

    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [email, setEmail] = useState('')

    const verify = async () => {
        // Change all of these to states and return JSX later

        if (userName === '' || password === '' || email === '') {
            return
        }

        if (password !== rePassword) {
            console.log('password must equal repassword')
        }

        const userNameCriteria = /^[a-z0-9]{3,16}$/.test(userName)
        const passwordCriteria = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
        if (userNameCriteria && passwordCriteria) {
            // const { db } = await connectToDatabase()
            // foundUser = await db.collection('users').find({username: userName}).toArray()
            // foundEmail = await db.collection('users').find({email: email}).toArray()

            // if (foundUser.length != 0) {
            //     alert('user already in database')
            //     return
            // }

            // if (foundEmail.length != 0) {
            //     alert('email already used')
            //     return
            // }
            
            // genSalt(saltRounds, function(err, salt) {
            //     hash(password, salt, function(err, hash) {
            //         if (err) {
            //             alert('error in storing user')
            //             return
            //         }
            //         // db.collection('users').insertOne({
            //         //     username: userName,
            //         //     email: email,
            //         //     password: hash
            //         // })

            //         alert('success!')
            //     })
            // })
        }

        if (!userNameCriteria) {
            const userNotification = document.createElement('div')
            const newContent = document.createTextNode('Username must be an alphanumeric string with 3 to 16 characters')
            userNotification.appendChild(newContent)
            const formElement = document.getElementsByTagName('form')[0]
            document.body.append(formElement, userNotification)
        }

        if (!passwordCriteria) {
            const userNotification = document.createElement('div')
            const newContent = document.createTextNode('Password must be 8 characters with a capital letter, number, and symbol')
            userNotification.appendChild(newContent)
            const formElement = document.getElementsByTagName('form')[0]
            document.body.append(formElement, userNotification)
        }

        return
    }

    return (
        <>
        <form onSubmit={(e) => {
            e.preventDefault()
            console.log('hh')
            verify()
        }}>
            Username <input type="text" onChange={(e) => setUserName(e.target.value)}/>
            <br></br>
            <br></br>
            Email <input type="email" onChange={(e) => setEmail(e.target.value)}/>
            <br></br>
            <br></br>
            Password <input type="password" className="password" onChange={(e) => setPassword(e.target.value)}/>
            Re-enter password <input type="password" className="password" onChange={(e) => setRePassword(e.target.value)}/>
            <button type="submit">Submit</button>
        </form>
        <button onClick={() => {
                var passwords = document.getElementsByClassName('password')
                for (var password of passwords) {
                    if (password.getAttribute('type') === 'password') {
                        password.setAttribute('type', 'text')
                    } else {
                        password.setAttribute('type', 'password')
                    }
                }
        }}>toggle pass</button>
        </>
    )
}