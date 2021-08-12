import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css'
import { useState } from 'react'
import { useRouter } from 'next/router'

function Login() {
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

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Login</title>
      </Head>
      <h1>LOGIN</h1>
      {errorMessage !== '' && <div>{errorMessage}</div>}
      <form onSubmit={(e) => {
        e.preventDefault()
        checkSubmission()
      }}>
        Username <input type='text' onChange={(e) => setUserName(e.target.value)}></input>
        <br>
        </br>
        Password <input type='password' onChange={(e) => setPassword(e.target.value)}></input>
        <br></br>
        <button type='submit'>Submit</button>
      </form>
    </>
  )
}

export default Login
