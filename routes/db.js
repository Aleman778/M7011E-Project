
/***************************************************************************
 * Defines the RESTful API of routes available in the db
 ***************************************************************************/


var express = require('express');
var db = require('./../controllers/queries.js');
var router = express.Router();


/**
 * Get route /db/allwind for retrieving all wind information.
 */
router.get('/allwind', db.getAllWindSpeed);


/**
 * Post route /db/wind for retrieving all wind information.
 */
router.post('/wind/:windSpeed', db.insertWindSpeed);


module.exports = router;
