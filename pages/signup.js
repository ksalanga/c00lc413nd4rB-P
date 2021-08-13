import SignupForm from '../components/forms/SignupForm.js'
import Navbar from '../components/nav/Navbar.js'

export default function Signup() { 
    return (
        <>
        <Navbar />
        <h1 style={{textAlign: "center"}}>Signup</h1>
        <div style={{textAlign: "center"}}><SignupForm /></div>
        </>
    )
}