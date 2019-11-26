
/***************************************************************************
 * Defines the RESTful API of routes available for the prosumers.
 ***************************************************************************/


var express = require('express');
var controller = require('./../controllers/prosumer.js');
var router = express.Router();


router.get('/login', controller.login);

module.exports = router;
