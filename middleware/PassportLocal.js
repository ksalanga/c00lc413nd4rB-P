import Local from 'passport-local'
import UserDataModel from '../models/UserDataModel'

const Users = new UserDataModel()

export default new Local.Strategy(
    async (username, password, done) => {
        try {
            const userFound = await Users.findUser(username)

            if (!userFound) return done(null, false, {message: 'No User'})

            const passwordFound = await Users.matchingPassword(username, password)

            if (!passwordFound) return done(null, false, {message: 'Incorrect password'})
            return done(null, userFound)
        } catch (e) {
            return done(e)
        }
    }
)