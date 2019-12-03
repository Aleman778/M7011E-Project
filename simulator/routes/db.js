/***************************************************************************
 * Defines the RESTful API of routes available in the db
 ***************************************************************************/


var express = require('express');
var db = require('./../controllers/wind-data.js');
var router = express.Router();


/**
 * Get route /db/allwind for retrieving all wind information.
 */
router.get('/allwind', db.getAllWindSpeed);


/**
 * Get route /db/windleq for retrieving the nearest wind speed that is lower or equal then timestamp.
 */
router.get('/windleq:timestamp', db.getWindSpeedLowEqual);


/**
 * Get route /db/windheq for retrieving the nearest wind speed that is higher or equal to timestamp.
 */
router.get('/windheq:timestamp', db.getWindSpeedHighEqual);


/**
 * Get route /db/nearest for retrieving the nearest wind speeds to timestamp.
 */
router.get('/nearest:timestamp', db.getNearestWindSpeeds);


/**
 * Get route /db/latest for retrieving latest measured wind speed.
 */
router.get('/latest', db.getLatestWindSpeed);


module.exports = router;
