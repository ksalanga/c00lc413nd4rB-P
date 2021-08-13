import loggedInUser from "../../utils/user"

export default function Navbar(props) {
    const user = loggedInUser()
    if (user !== undefined) {var loggedIn = true}
    else {var loggedIn = false}

    return (
        <nav className="nav-tabs navbar navbar-expand-lg navbar-light bg-light justify-content-center">
            <a className="navbar-brand" href='/'>Cool Calendar 📅</a>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                <li class="nav-item active">
                    <a class="nav-link" href="#">Live Events</a>
                </li>
                {(!props.login && !loggedIn) && <li class="nav-item">
                    <a class="nav-link" href="/login">Login</a>
                </li>}
                <li><a class="nav-link" href="#">{user}</a></li>
                </ul>
            </div>
        </nav>
    )
}
