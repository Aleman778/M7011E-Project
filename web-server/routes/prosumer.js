
/***************************************************************************
 * Defines the RESTful API of routes available for the prosumers.
 ***************************************************************************/


var express = require('express');
var controller = require('../controllers/prosumer');
var authorize = require('./middleware/auth');
var router = express.Router();


/**
 * Views the /prosumer/signin page
 */
router.get('/signin', function(req, res) {
    console.log("hello universe!");
    res.render('prosumer/signin');
});


/**
 * Views the /prosumer/signup page
 */
router.get('/signup', function(req, res) {
    res.render('prosumer/signup');
});


/**
 * POST request /prosumer/signin used for prosumer signin.
 */
router.post('/signin', controller.loginProsumer);


/**
 * POST request /prosumer/signup for creating a new prosumer account.
 */
router.post('/signup', controller.createProsumer);


/**
 * GET request /prosumer/dashboard for accessign a prosumers dashboard.
 */
router.get('/dashboard', [authorize], function(req, res) {
    let User = require('../models/user');
    res.render('prosumer/dashboard', {user: User.findOne({id: req.userId})})
});


module.exports = router;
