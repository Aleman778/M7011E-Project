
/***************************************************************************
 * Defines the routes for the manager.
 ***************************************************************************/


var express = require('express');
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var router = express.Router();

/**
 * Enable the authorization middleware to accept managers.
 */
router.use(auth.enable('manager'));




/**
 * Views the /prosumer/signin page
 */
router.get('/signin', function(req, res) {
    res.render('manager/signin', {alerts: req.alert()});
});


/**
 * Views the /prosumer/signup page
 */
router.get('/signup', function(req, res) {
    res.render('manager/signup', {alerts: req.alert()});
});


/**
 * POST request /prosumer/signin used for prosumer signin.
 */
// router.post('/signin', validate.prosumer.signin, prosumerController.signin);


/**
 * POST request /prosumer/signup for creating a new prosumer account.
 */
// router.post('/signup', validate.prosumer.signup, prosumerController.signup);


/**
 * POST request /prosumer/signout for signing out a prosumer account.
 */
router.get('/signout', auth.destroy, function(req, res) {
    res.redirect('./signin');
});


/**
 * Expose the router.
 */
module.exports = router;
