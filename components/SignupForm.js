import { useState } from 'react'

export default function SignupForm() {

    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [email, setEmail] = useState('')

    const verify = async () => {
        // Change all of these to states and return JSX later
        // Errors: userName, email, password, password not matching repassword

        if (userName === '' || password === '' || email === '') {
            return
        }

        if (password !== rePassword) {
            return
        }

        const validateUserName = /^[a-z0-9]{3,16}$/.test(userName)
        const validatePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
        const validateEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(email)

        if (!validateUserName) {
            const userNotification = document.createElement('div')
            const newContent = document.createTextNode('Username must be an alphanumeric string with 3 to 16 characters')
            userNotification.appendChild(newContent)
            const formElement = document.getElementsByTagName('form')[0]
            document.body.append(formElement, userNotification)
        }

        if (!validatePassword) {
            const userNotification = document.createElement('div')
            const newContent = document.createTextNode('Password must be 8 characters with a capital letter, number, and symbol')
            userNotification.appendChild(newContent)
            const formElement = document.getElementsByTagName('form')[0]
            document.body.append(formElement, userNotification)
        }

        if (validateUserName && validatePassword && validateEmail) {
            console.log('valid')
            const form = {username: userName, email: email, password: password}
            await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            }).then(response => response.json())
            .then(data => console.log(data))
        }
    }

    return (
        <>
        <form onSubmit={(e) => {
            e.preventDefault()
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