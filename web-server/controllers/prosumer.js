
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


var {User, validate} = require('../models/user')


/**
 * Creates a new prosumer account and registers it in the simulation.
 * @param {object} req the request object
 * @param {object} res the response object
 */
exports.createProsumer = async function(req, res) {
    console.log(req.body);
}


/**
 * Sign in a prosumer.
 * @param {object} req the request object
 * @param {object} res the response object
 */
exports.loginProsumer = async function(req, res) {
    console.log(req.body);
}
