
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


/**
 * Creates a new prosumer account and registers it in the simulation.
 */
exports.signupProsumer = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log(req.body);
    let json = JSON.stringify(req.body);
    res.end(json);
}


/**
 * Sign in a prosumer
 */
exports.signinProsumer = function(req, res) {
    console.log(req.body);
}
