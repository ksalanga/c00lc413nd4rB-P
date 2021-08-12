export default function LoginForm() {
    return (
        <>
        <form onSubmit={() => {

        }}>
            Username <input type="text" />
            <br></br>
            <br></br>
            Password <input type="password" />
        </form>

        <button onClick={() => {
                var password = document.getElementsByTagName('input')[1]
                if (password.getAttribute('type') === 'password') {
                    password.setAttribute('type', 'text')
                } else {
                    password.setAttribute('type', 'password')
                }
        }}>toggle pass</button>
        </>
    )
}