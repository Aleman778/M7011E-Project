
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


const User = require('../models/user');


/**
 * Creates a new prosumer account and registers it in the simulation.
 * @param {object} req the request object
 * @param {object} res the response object
 */
exports.createProsumer = async function(req, res) {
    let created_at = new Date();
    let user = new User(
        req.body.name,
        req.body.email,
        "prosumer",
        created_at,
        created_at
    );

    try {
        const token = await user.store(req.body.password);
        console.log(token);
        if (token) {
            res.status(201).send(token);
        } else {
            res.status(400).send({message: "failed to create a new user"});
        }
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}


/**
 * Sign in a prosumer.
 * @param {object} req the request object
 * @param {object} res the response object
 */
exports.loginProsumer = async function(req, res) {
    const token = User.login(req.body.email, req.body.password);
    console.log(token);
    if (token) {
        res.status(200).send(token);
    } else {
        res.status(400).send(token);
    }
}
