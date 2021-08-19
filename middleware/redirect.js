import nextConnect from "next-connect"
import authenticate from "./authenticate"

export default async function redirect(req, res) {
    const handler = nextConnect().use(authenticate)

    try {
        await handler.run(req, res)
        var user = req.session?.get('user')
        if (user !== {} && user !== undefined) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            }
        }
        return { props: {} }
    } catch (error) {
        return { props: { error } }
    }
}