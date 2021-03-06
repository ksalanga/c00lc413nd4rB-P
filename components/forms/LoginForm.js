import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../../styles/login.module.css'

export default function LoginForm() {
    const router = useRouter()
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [textOrPass, setTextOrPass] = useState('password')


    useEffect(() => {}, [errorMessage])
    
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

        const message = await response.text()

        if (response.ok) {
            router.push('/')
        } else {
            setErrorMessage(message)
        }
    }

    return(
        <>
        <h1 className={styles.center}>LOGIN</h1>
        {errorMessage !== '' && <div className={styles.center}><b>{errorMessage}</b></div>}
        <form className={styles.center} onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()
        }}>
            <div>Username</div>
            <input type='text' onChange={(e) => setUserName(e.target.value)}></input>
            <br></br>
            <div>Password</div>
            <input type={textOrPass} onChange={(e) => setPassword(e.target.value)}></input>
            <br></br>
            <br></br>
            <button type='submit'>Submit</button>
            <button onClick={(e) => { e.preventDefault()
            setTextOrPass(textOrPass === 'password' ? 'text' : 'password')}}>👁️</button>

        </form>
        <br></br>
        <div className={styles.center}>Don't Have an Account?</div>
        <b><div className={styles.center}><Link href="/signup">Signup</Link></div></b>
        </>
    )
}