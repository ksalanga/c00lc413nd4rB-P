import nextConnect from 'next-connect'
import authenticate from '../middleware/authenticate'
import ProfileForm from '../components/forms/ProfileForm'
import Head from 'next/head'
import Navbar from '../components/nav/Navbar'

export default function Profile({ user }) {

    return (
        <>
        <Head>
            <title>{user?.username}'s Profile Page</title>
        </Head>
        <Navbar user={user}></Navbar>
        <ProfileForm user={user}></ProfileForm>
        </>
    )
}

export async function getServerSideProps({req, res}) {
    const handler = nextConnect().use(authenticate)

    try {
        await handler.run(req, res)
        var user = req.session?.get('user')
        if (user === {} || user === undefined) { 
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            }
        }
        return { props: { user } }
      } catch (e) {
        console.log(e)
        return { props: {} }
      }
}