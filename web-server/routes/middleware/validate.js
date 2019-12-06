
/***************************************************************************
 * Validation middleware assures that the inputs from forms are
 * properly assigned and valid.
 ***************************************************************************/


const User = require('.../models/user');


/**
 * Validates a user login information.
 */
exports.validateLogin = function(req, res, next) {
    if (!body.email || !body.password) {
        return res.status(400).send({message: "Some fields are missing values."});
    }

    if (!isValidEmail(body.email)) {
        errors.insert({message: "Your provided email address is not valid."})
    }
}


/***************************************************************************
 * Helper methods
 ***************************************************************************/


/**
 * Validates an email address.
 * @param {string} email the email to verify
 * @param {bool} returns true if email is valid
 */
function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
