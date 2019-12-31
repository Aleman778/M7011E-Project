
/***************************************************************************
 * The authentication routes are used to sign in and sign up users
 * with specfic roles in the system.
 ***************************************************************************/


var express = require('express');
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var authController = require('../controllers/auth-controller');
var router = express.Router();


/**
 * POST request /authenticate/signin/prosumer to signin as prosumer.
 */
router.post('/prosumer/signin',
            validate.prosumer.signin,
            authController.signinProsumer);


/**
 * POST request /authenticate/signup/prosumer to signup as prosumer.
 */
router.post('/prosumer/signup',
            validate.prosumer.signup,
            authController.signupProsumer);


/**
 * Expose the router.
 */
module.exports = router;
