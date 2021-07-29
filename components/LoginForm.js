
// Plan
// SWR React Hook for Fetching Data
// Either continue with MongoDB or use the Prisma ORM which is a bit simpler when dealing with Next.JS
// Password Hash + Salt function needed to post to database
// User ID Token generated for each session in cookies

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