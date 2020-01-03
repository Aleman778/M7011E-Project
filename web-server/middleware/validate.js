
/***************************************************************************
 * Validation middleware assures that the inputs from forms are
 * properly assigned and valid.
 ***************************************************************************/


const { check, validationResult } = require('express-validator');


/**
 * Validatation code for prosumers.
 */
exports.prosumer = {
    /**
     * Validates a prosumer sign in information.
     */
    signin: [
        checkEmail('email'),
        checkPassword('password'),
        validate('/prosumer/signin'),
    ],


    /**
     * Validates a prosumer sign up information.
     */
    signup: [
        checkName('name'),
        checkEmail('email'),
        checkPassword('password'),
        validate('/prosumer/signup'),
    ],

    
    /**
     * Validates prosumer update profile information.
     */
    updateProfile: [
        checkName('name'),
        checkEmail('email'),
        validate('/prosumer/settings/profile'),
    ],


    /**
     * Validates prosumer password update information.
     */
    updatePassword: [
        checkNonEmpty('oldPassword'),
        checkPassword('newPassword'),
        checkNonEmpty('repPassword')
            .custom((repPassword, { req }) => {
                if (repPassword === req.body.newPassword) {
                    return true;
                } else {
                    throw new Error("The confirmation passwords does not match your new password.")
                }
            }),
        validate('/prosumer/settings/security'),
    ],

    
    /**
     * Validates password confirmation when deleting an account.
     */
    deleteAccount: [
        checkPassword('password'),
        validate('/prosumer/settings/account'),
    ]
};



/**
 * Validation code for managers.
 */
exports.manager = {
    /**
     * Validates a manager sign in information.
     */
    signin: [
        checkEmail('email'),
        checkPassword('password'),
        validate('/manager/signin'),
    ],


    /**
     * Validates a manager sign up information.
     */
    signup: [
        checkName('name'),
        checkEmail('email'),
        checkPassword('password'),
        validate('/manager/signup'),
    ],
     
    /**
     * Validates manager update profile information.
     */
    updateProfile: [
        checkName('name'),
        checkEmail('email'),
        validate('/manager/settings/profile'),
    ],


    /**
     * Validates manager password update information.
     */
    updatePassword: [
        checkNonEmpty('oldPassword'),
        checkPassword('newPassword'),
        checkNonEmpty('repPassword')
            .custom((repPassword, { req }) => {
                if (repPassword === req.body.newPassword) {
                    return true;
                } else {
                    throw new Error("The confirmation passwords does not match your new password.")
                }
            }),
        validate('/manager/settings/security'),
    ],
}


/**
 * Checks a from the request with the given name attribute (from DOM).
 */
function checkName(name) {
    return check(name)
        .exists().withMessage('The ' + name + ' field is required')
        .bail()
        .not().isEmpty().withMessage('The ' + name + ' field cannot be empty')
        .bail()
        .isLength({max: 120}).withMessage('Names cannot be longer than 120 characters.');
}


/**
 * Checks an email from the request with the given name.
 * This checks for existance, validity and length of an email.
 */
function checkEmail(name) {
    return check(name)
        .exists().withMessage('The ' + name + ' field is required.')
        .bail()
        .not().isEmpty().withMessage('The ' + name + ' field cannot be empty')
        .bail()
        .isLength({max: 120}).withMessage('Email address cannot be longer than 120 characters.')
        .normalizeEmail({gmail_remove_dots: false}).isEmail().withMessage('The email address is not valid.');
}

 
/**
 * Checks a password from the request with the given name.
 * This checks for existence, string, length and types of characters.
 */
function checkPassword(name) {
    return check(name)
        .exists().withMessage('The ' + name + ' field is required.')
        .bail()
        .not().isEmpty().withMessage('The ' + name + ' field cannot be empty')
        .bail()
        .isString().withMessage('The password must be a string.')
        .bail()
        .isLength({min: 4}).withMessage('Passwords must contain atleast 4 characters.')
        .isLength({max: 120}).withMessage('Passwords cannot be longer than 120 characters.')
        .bail()
        .matches(/^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d@$.!%*#?&]{4,}$/)
        .withMessage('The password must contain both letters and numbers, optionally with special characters.');
}


function checkNonEmpty(name) {
    return check(name).exists().withMessage('The ' + name + ' field is required.')
        .bail()
        .not().isEmpty().withMessage('The ' + name + ' field cannot be empty')
        .bail();
}


/**
 * Validates a list containing chain of validations.
 * This should be placed at the end of each validation middleware array.
 * @param {string} optionally redirect user to page on validation errors, else send 400 bad request.
 * @returns {function} middleware fucntion that checks the validation retsults acts on errors.
 */
function validate(redirectOnFail) {
    return function(req, res, next) {
        const result = validationResult(req);
        if (result.isEmpty()) return next();
        if (redirectOnFail == undefined) {
            res.status(400).send(result);
        } else {
            result.errors.forEach(error => {
                req.err(error.msg);
            });
            res.redirect(redirectOnFail);
        }
    }
}
