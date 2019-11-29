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
 * Get route /db/windl for retrieving the nearest wind speed that is lower or equal to timestamp.
 */
router.get('/windl:timestamp', db.getWindSpeedLowEq);


/**
 * Get route /db/windh for retrieving the nearest wind speed that is higher or equal to timestamp.
 */
router.get('/windh:timestamp', db.getWindSpeedHighEq);


/**
 * Get route /db/latest for retrieving latest measured wind speed.
 */
router.get('/latest', db.getLatestWindSpeed);


module.exports = router;