
/***************************************************************************
 * Helper methods for hasing passwords and token signing.
 ***************************************************************************/


const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


/**
 * Hash and salt the password using bcrypt.
 */
exports.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}


/**
 * Compare the given password with the hash.
 */
exports.comparePassword = function(password, hash) {
    return bcrypt.compareSync(password, hash)
}


/**
 * Generates a login token that is used to
 * verfiy that a user has logged in.
 */
exports.generateToken = function(user) {
    const payload = {
        userId: user.id,
        userRole: user.role,
    };
    const options = {
        expiresIn: "12h",
        algorithm: "HS256",
    };
    const token = jwt.sign(payload, process.env.WS_PRIVATE_KEY, options);
    return token;
}
