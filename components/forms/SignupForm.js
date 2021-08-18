import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SignupForm() {
    const router = useRouter()
    const [form, setForm] = useState({username: '', email: '', password: '', repassword: ''})
    const [textOrPass, setTextOrPass] = useState('password')
    const [serverMessage, setServerMessage] = useState('')

    useEffect(() => {}, [serverMessage])

    const verify = async () => {
        if (form['username'] === '' || form['password'] === '' || form['email'] === '') return

        const isMatching = form['password'] === form['repassword']

        if (!isMatching) {
            setServerMessage('Passwords must match')
            return
        }

        const submission = {username: form['username'], email: form['email'], password: form['password']}
        const response = await fetch('/api/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submission)
        })

        const message = await response.text()
        if (response.ok) {
            router.push('/')
        } else {
            setServerMessage(message)
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
        </>
    )
}