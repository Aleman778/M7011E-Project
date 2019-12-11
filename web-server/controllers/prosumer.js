
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


const User = require('../models/user');
const helper = require('../models/helper');


/**
 * The prosumer controller handles all the actions that a prosumer does
 * such as login, signup etc.
 */
class ProsumerController {
    
    /**
     * Creates a new prosumer controller.
     */
    constructor() { }
    

    /**
     * Creates a new prosumer account and registers it in the simulation.
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async createProsumer(req, res) {
        var user = await User.findMany({email: req.body.email});
        if (user.length > 0) {
            req.alert('danger', 'There already exists an account with that email address. ' +
                      'If this is your account you can signin instead.');
            return res.redirect('/prosumer/signup');
        }
        
        const passwordHash = helper.hashPassword(req.body.password);
        let created_at = new Date();
        user = new User(
            req.body.name,
            req.body.email,
            "prosumer",
            created_at,
            created_at,
        );
        user.password = passwordHash;
        console.log(user);
        try {
            await user.store();
            const token = helper.generateToken(user);
            if (token) {
                req.session.token = token;
                res.redirect("/prosumer/dashboard");
            } else {
                res.status(400).send({ message: "failed to create a new user" });
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
    async loginProsumer(req, res) {
        try {
            const user = await User.findMany({email: req.body.email});
            if (user.length > 0 &&helper.comparePassword(req.body.password, user[0].password)) {
                const token = helper.generateToken(user[0]);
                req.session.token = token;
                res.redirect("/prosumer/dashboard");
            } else {
                req.alert('danger', 'The email or password is incorrect, please try again.');
                return res.redirect("/prosumer/signin")
            }
        } catch(err) {
            console.log(err);
            return res.status(400).send(err);
        }
    }


    /**
     * Show a prosumers dashboard.
     * Should provide an auth middleware for accessing this.
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async viewDashboard(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            res.render('prosumer/dashboard', {user: user});
        } catch(err) {
            res.send(400).send(err);
        }
    }


    /**
     * Show a prosumers settings view.
     * Should provide an auth middleware for accessing this.
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async viewSettings(req, res) {
        try {
            const user = await User.findOne({id: "9e123f09-0743-4ec4-bb22-f054ccdda871"});
            const page = req.body
            res.render('prosumer/settings/profile', {user: user, alerts: req.alert()});
        } catch(err) {
            res.send(400).send(err);
        }
    }
}


module.exports = new ProsumerController();
