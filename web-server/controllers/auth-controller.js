
/***************************************************************************
 * The authentication controller is used to signin and signup users.
 ***************************************************************************/


var User = require('../models/user');
var helper = require('../models/helper');
var http = require('http');


/**
 * Authentication controller class is used to authenticate users.
 * This uses the users database table. This only handles POST
 * requests each user role can implement their own GET requests for
 * sending 
 */
class AuthController {
    /**
     * Creates a new auth controller.
     */
    constructor() { }


    /**
     * Signin a prosumer and redirect the user to the correct route.
     */
    async signinProsumer(req, res) {
        try {
            if (await signinUser(req, res, 'prosumer')) {
                if (req.session.redirectTo) {
                    let url = req.session.redirectTo;
                    req.session.redirectTo = undefined;
                    return res.redirect(url);
                } else {
                    return res.redirect('/prosumer');
                }
            }
        } catch (err) {
            console.log(err);
            req.whoops();
        }
        return res.status(401).render('prosumer/signin', {alerts: req.alert()});
    }


    /**
     * Signup a prosumer and redirect the user to the correct route.
     */
    async signupProsumer(req, res) {
        try {
            if (await signupUser(req, res, 'prosumer')) {
                return res.redirect('/prosumer');
            }
        } catch (err) {
            console.log(err);
            req.whoops();
        }
        return res.status(400).render('prosumer/signup', {alerts: req.alert()});
    }
}


/**
 * Signin a user of specified role.
 */
async function signinUser(req, res, role) {
    let users = await User.findMany({email: req.body.email});
    if (users.length > 0) {
        const user = users[0];
        if (user.role !== role) {
            req.err('The account you tried to sign in to is not a ' + role + ' account.');
            return undefined;
        }
        if (helper.comparePassword(req.body.password, user.password)) {
            const token = helper.generateToken(user);
            req.session.token = token;
            return user;
        }
    }
    req.err('The email or password is incorrect, please try again.');
    return undefined;
}


/**
 * Signup a user of specified role.
 */
async function signupUser(req, res, role) {
    let sameEmail = await User.findMany({email: req.body.email});
    if (sameEmail.length > 0) {
        req.err('There already exists an account with that email address. ' +
                'If this is your account you can signin instead.');
        return undefined;
    }
    const passwordHash = helper.hashPassword(req.body.password);
    var user = new User(req.body.name, req.body.email, role);
    user.password = passwordHash;
    await user.store();
    const token = helper.generateToken(user);
    if (token) {
        req.session.token = token;
        return user;
    } else {
        req.err('Failed to create the account!');
    }
    return undefined;
}


/**
 * Expose the auth controller instance.
 */
module.exports = new AuthController();
