import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css'
import { useState } from 'react'

function Login() {
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')

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

    console.log(response)
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Login</title>
      </Head>
      <h1>LOGIN</h1>
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
