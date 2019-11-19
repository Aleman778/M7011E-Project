
/***************************************************************************
 * Defines the RESTful API of routes available in the db
 ***************************************************************************/


var express = require('express');
var db = require('./../controllers/queries.js');
var router = express.Router();


/**
 * Post route /db/allwind for retrieving all wind information.
 */
router.post('/allwind', db.getAllWindSpeed);


module.exports = router;
