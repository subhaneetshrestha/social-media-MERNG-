const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../../models/User');

module.exports = {
    Mutation: {
        async registerUser(_, {
            registerInput: {
                username,
                email,
                password,
                confirmPassword
            }
        }) {
            // TODO Validate user data
            // TODO Make sure user doesn't already exist
            const user = await User.findOne({ username });

            if(user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            // TODO Hash the password before storing
            // TODO Create an auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const result = await newUser.save();

            const token = jwt.sign({
                id: result.id,
                email: result.email,
                username: result.username
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return {
                ...result._doc,
                id: result._id,
                token
            }
        }
    }
}