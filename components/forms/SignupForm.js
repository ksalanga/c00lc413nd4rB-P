import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SignupForm() {
    const router = useRouter()
    const [form, setForm] = useState({username: '', email: '', password: '', repassword: ''})
    const [validUserName, setValidUserName] = useState(null)
    const [validEmail, setValidEmail] = useState(null)
    const [validPassword, setValidPassword] = useState(null)
    const [matchingPassword, setMatching] = useState(null)
    const [textOrPass, setTextOrPass] = useState('password')
    const [serverMessage, setServerMessage] = useState('')

    useEffect(() => {
    }, [validUserName, validEmail, validPassword, matchingPassword])

    const verify = async () => {
        if (form['username'] === '' || form['password'] === '' || form['email'] === '') return

        const isValidUserName = /^[a-z0-9]{3,16}$/.test(form['username'])
        const isValidEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(form['email'])
        const isValidPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(form['password'])
        const isMatching = form['password'] === form['repassword']

        if (isValidUserName) setValidUserName(true)
        else setValidUserName(false)

        if (isValidEmail) setValidEmail(true)
        else setValidEmail(false)

        if (isValidPassword) setValidPassword(true)
        else setValidPassword(false)

        if (isMatching) setMatching(true)
        else setMatching(false)

        if (isValidUserName && isValidPassword && isValidEmail && isMatching) {
            const submission = {username: form['username'], email: form['email'], password: form['password']}
            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submission)
            })

            const message = await response.json()
            if (response.ok) {
                router.push('/')
            } else {
                setServerMessage(message.message)
            }
        }
    }

    return (
        <>
        {(serverMessage !== '' && serverMessage !== 'New User Created.') && <div><b>{serverMessage}</b></div>}
        <form onSubmit={(e) => {
            e.preventDefault()
            verify()
        }}>
            <div>Username</div>
            <input type="text" onChange={(e) => setForm({...form, ['username']: e.target.value})}/>
            <br></br>
            <div>Email</div>
            <input type="email" onChange={(e) => setForm({...form, ['email']: e.target.value})}/>
            <br></br>
            <div>Password</div>
            <input type={textOrPass} className="password" onChange={(e) => setForm({...form, ['password']: e.target.value})}/>
            <br></br>
            <div>Re-enter password</div>
            <input type={textOrPass} className="password" onChange={(e) => setForm({...form, ['repassword']: e.target.value})}/>
            <br></br>
            <button type="submit">Submit</button>
        </form>
        <button onClick={(e) => { e.preventDefault()
            setTextOrPass(textOrPass === 'password' ? 'text' : 'password')}}>👁️</button>
        {validUserName === false && <div><b>invalid username</b></div>}
        {validEmail === false && <div><b>invalid email</b></div>}
        {validPassword === false && <div><b>invalid password</b></div>}
        {matchingPassword === false && <div><b>passwords must match</b></div>}
        </>
    )
}