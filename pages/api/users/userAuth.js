// get current user logged in
import { default as auth, checkAuthentication } from "../../../middleware/authenticate"
import nextConnect from "next-connect"

const handler = nextConnect()

handler.use(auth)
.get(checkAuthentication, (req, res) => {
    res.status(200).json({ 'user': req.session.passport.user })
})

export default handler