import SignupForm from '../components/forms/SignupForm.js'
import Navbar from '../components/nav/Navbar.js'
import redirect from '../middleware/redirect.js'

export default function Signup() { 
    return (
        <>
        <Navbar />
        <h1 style={{textAlign: "center"}}>Signup</h1>
        <div style={{textAlign: "center"}}><SignupForm /></div>
        </>
    )
}

export async function getServerSideProps({req, res}) {
    return redirect(req, res)
}