import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../../styles/login.module.css'

export default function LoginForm() {
    const router = useRouter()
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const checkSubmission = async () => {
        if (username === '' || password === '') return

        const payload = {
        username: username,
        password: password
        }

        const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
        })

        if (response.ok) {
        router.push('/')
        } else {
        const message = await response.json()
        setErrorMessage(message.message)
        }
    }

    return(
        <>
        <h1 className={styles.center}>LOGIN</h1>
        {errorMessage !== '' && <div>{errorMessage}</div>}
        <form className={styles.center} onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()
        }}>
            <div>Username</div>
            <input type='text' onChange={(e) => setUserName(e.target.value)}></input>
            <br></br>
            <div>Password</div>
            <input type='password' onChange={(e) => setPassword(e.target.value)}></input>
            <br></br>
            <br></br>
            <button type='submit'>Submit</button>
        </form>
        <br></br>
        <div className={styles.center}>Don't Have an Account?</div>
        <b><div className={styles.center}><Link href="/signup">Signup</Link></div></b>
        </>
    )
}