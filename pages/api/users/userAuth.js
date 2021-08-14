// get current user logged in
import { default as auth, checkAuthentication } from "../../../middleware/authenticate"
import nextConnect from "next-connect"

const handler = nextConnect()

handler.use(auth)
.get(checkAuthentication, (req, res) => {
    // Serialize only sends the user String, no other attributes
    res.status(200).end(JSON.stringify({user: req.session.passport.user}))
})

export default handler