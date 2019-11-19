
/***************************************************************************
 * Defines the RESTful API of routes available in the simulator
 ***************************************************************************/


var express = require('express');
var controller = require('./../controllers/simulator.js');
var router = express.Router();

// var db = require('./../db/queries.js');

// router.get('/allwind', db.getALlWindSpeed);

/**
 * Get route /simulator/wind for retrieving the wind information.
 */
router.get('/wind', controller.getWindSpeed);


/**
 * Get route /simulator/prosumer/:id for retrieving a specific prosumer information.
 */
router.get('/prosumer/:id', controller.getProsumerData);


/**
 * Post route /simulator/prosumer/register for creating a new prosumer.
 */
router.post('/prosumer/register', controller.createProsumer);


/**
 * Get route /simulator/electricity/price for retrieving the electricity price.
 */
router.get('/electricity/price', controller.getElectricityPrice);


module.exports = router;
