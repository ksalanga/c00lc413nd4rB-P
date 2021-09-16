import Image from 'next/image'
import undecidedCalendar from '../public/undecidedCalendar.svg'
import decidedCalendar from '../public/date.svg'
import Navbar from '../components/nav/Navbar'
import nextConnect from 'next-connect'
import authenticate from '../middleware/authenticate'

export default function Credits({user}) {
    return(
        <>
            <Navbar user={user}></Navbar>
            <div style={{textAlign:'center'}}>
                <h1>Credits:</h1>
                <Image src={undecidedCalendar} width='90%' height='90%'></Image>
                <div>Icons made by <a href="https://www.flaticon.com/authors/prosymbols" title="Prosymbols">Prosymbols</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                <Image src={decidedCalendar} width='90%' height='90%'></Image>
                <div>Icons made by <a href="https://www.flaticon.com/authors/becris" title="Becris">Becris</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
            </div>
        </>
    )
}

export async function getServerSideProps({req, res}) {
    const handler = nextConnect().use(authenticate)

    try {
        await handler.run(req, res)
        var user = req.session?.get('user')
        if (user === {} || user === undefined) { user = null }

        return { props: { user } }
    } catch (e) {
        console.log(e)
        return { props: {} }
    }
}