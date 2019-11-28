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


router.get('/windl:timestamp', db.getWindSpeedLowEq);


router.get('/windh:timestamp', db.getWindSpeedHighEq);


router.get('/latest', db.getLatestWindSpeed);


module.exports = router;
