import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css'
import Navbar from '../components/nav/Navbar'
import LoginForm from '../components/Forms/LoginForm'

function Login() {

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Login</title>
      </Head>
      <Navbar loginPage={true}></Navbar>
      <LoginForm />
    </>
  )
}

export default Login
