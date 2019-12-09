
/***************************************************************************
 * Validation middleware assures that the inputs from forms are
 * properly assigned and valid.
 ***************************************************************************/


const User = require('../../models/user');
const { check, validationResult } = require('express-validator');


/**
 * Validates a user login information.
 */
exports.prosumerSignin = [
    checkEmail('email'),
    checkPassword('password'),
    validate('./signin'),
];


exports.prosumerSignup = [
    checkEmail('email'),
    checkPassword('password'),
    validate('./signup'),
]


function checkEmail(name) {
    return check(name)
        .exists().withMessage('The email field is required.')
        .isLength({max: 120}).withMessage('Email address cannot be longer than 120 characters.')
        .normalizeEmail().isEmail().withMessage('The email address is not valid.');
}


function checkPassword(name) {
    return check(name)
        .exists().withMessage('The password field is required.')
        .isString().withMessage('The password must be a string.')
        .isLength({min: 4}).withMessage('Passwords must contain atleast 4 characters.')
        .isLength({max: 120}).withMessage('Passwords cannot be longer than 120 characters.')
        .bail()
        .matches(/^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d@$.!%*#?&]{4,}$/)
        .withMessage('The password must contain both letters and numbers, optionally with special characters.')
}


function validate(redirectOnFail) {
    return function(req, res, next) {
        const result = validationResult(req);
        if (result.isEmpty()) return next();
        if (redirectOnFail == undefined) {
            res.status(400).send(result);
        } else {
            result.errors.forEach(error => {
                req.alert('danger', error.msg);
            });
            res.redirect(redirectOnFail);
        }
    }
}
