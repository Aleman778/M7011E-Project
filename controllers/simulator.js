
/***************************************************************************
 * The simulator controller handles different actions for the simulator
 * module.
 ***************************************************************************/


var simulator = require('./../models/simulator.js');


/**
 * Returns the wind speed for this hour.
 */
exports.getWindSpeed = function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    let output = simulator.getCurrentWindSpeed();
    let json = JSON.stringify(output);
    res.end(json);
}


/**
 * Returns the data of a prosumer with the specified id.
 */
exports.getProsumerData = function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    let output = simulator.getProsumerData(req.params.id);
    let json = JSON.stringify(output);
    if (output.status != null) {
        res.status(output.status);
    }
    res.end(json);
}


/**
 * Creates a new prosumer from 
 */
exports.createProsumer = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    let output = simulator.createProsumer(req.params)
    let json = JSON.stringify(output);
    res.end(json);
}


/**
 * Retrurns the current electricity price.
 */
exports.getElectricityPrice = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    let output = simulator.getElectricityPrice();
    let json = JSON.stringify(output);
    res.end(json);
}
