import Head from "next/head"
import { useRouter } from "next/router"
import Image from 'next/image'
import defaultPic from '../../public/default.png'
import styles from '../../styles/profilepicture.module.css'

function Navbar({ user, loginPage }) {
    const router = useRouter()

    const logOut = async () => {
        const response = await fetch('/api/users/logout', {method: 'GET'})

        if (response.ok) {
            router.reload('/')
        }
    }

    if (user) {
        var rightSideItem = 
        <li className="nav-item dropdown">
            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><Image src={user.profilePicture ? user.profilePicture : defaultPic} width="35%" height="35%" className={styles.profilePic} alt='profilePicture' /></a>
            <div className="dropdown-menu dropdown-menu-end">
                <a className="dropdown-item"><b>{user.username}</b></a>
                <a href="#" className="dropdown-item">My Events</a>
                <a href="/profile" className="dropdown-item">Edit Profile</a>
                <div className="dropdown-divider"></div>
                <a href="#" onClick={logOut} className="dropdown-item">Logout</a>
            </div>
        </li>
    } else {
        var rightSideItem = <a className="nav-link" href="/login">Login</a>
    }

    return (
        <>
        <Head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossOrigin="anonymous"></link>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.min.js" integrity="sha384-cn7l7gDp0eyniUwwAZgrzD06kc/tftFf19TOAs2zVinnD/C7E91j9yyk5//jjpt/" crossOrigin="anonymous"></script>
        </Head>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a className="navbar-brand" href='/' style={{paddingLeft:"15px"}}>Cool Calendar 📅</a>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="nav navbar-nav">
                    <li className="nav-item active">
                        <a className="nav-link" href="#">Live Events</a>
                    </li>
                    <li className="nav-item active">
                        <a className="nav-link" href="/credits">Credits</a>
                    </li>
                </ul>
            </div> {!loginPage &&
            <ul className="nav navbar-nav ml-auto">
                {rightSideItem}
            </ul>}
        </nav>
        </>
    )
}

export default Navbar