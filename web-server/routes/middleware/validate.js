
/***************************************************************************
 * Validation middleware assures that the inputs from forms are
 * properly assigned and valid.
 ***************************************************************************/


const User = require('../../models/user');


/**
 * Validates a user login information.
 */
exports.signin = function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ 'message': 'Some fields are missing values.' });
    }

    let errors = [];
    if (!isValidEmail(req.body.email)) {
        errors.push({ 'message': 'Your provided email address is not valid.' });
    }

    checkRanges(req.body, errors);
    
    if (errors.length > 0) {
        return res.status(400).send({errors: errors})
    } else {
        next();
    }    
}


/**
 * Valides a user signup information.
 */
exports.signup = function(req, res, next) {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).send({ 'message': 'Some fields are missing values.' });
    }

    let errors = [];
    if (!isValidEmail(req.body.email)) {
        errors.push({ 'message': 'Your provided email address is not valid.' });
    }
    
    checkRanges(req.body, errors);

    
    if (req.body.name.length < 4) {
        errors.push({ 'message': 'Your name has to include atleast 4 characters.' });
    }
    
    
    if (req.body.name.length > 128) {
        errors.push({ 'message': 'Your name cannot include more than 128 characters.' });
    }
    
    if (errors.length > 0) {
        return res.status(400).send({errors: errors})
    } else {
        next();
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


/**
 * Check the length of email and password agains a defined range.
 */
function checkRanges(body, errors) {
    if (body.email.length > 128) {
        errors.push({ 'message': 'Your email cannot include more than 128 characters.' });
    }

    // Annoying for debugging, maybe 
    // if (body.password.length < 6) {
        // errors.push({ 'message': 'Your password has to include atleast 6 characters.' });
    // }
    
    if (body.password.length > 128) {
        errors.push({ 'message': 'Your password cannot include more than 128 characters.' });
    }
}
