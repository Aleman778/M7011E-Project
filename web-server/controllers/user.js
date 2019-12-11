
/***************************************************************************
 * The user controller handles general actions that any user in the
 * system can perform such as login, signup, change basic settings.
 ***************************************************************************/



const User = require('../models/user');
const helper = require('../models/helper');


/**
 * Abstract user controller defines basic user functions that
 * are not specific to the user role. This class should not
 * be instantiated but only extended to provide the full
 * feature set for the specific user role.
 */
class UserController {
    /**
     * Creates a new prosumer controller.
     */
    constructor(domain) {
        this.domain = domain;
    }

    
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
                res.redirect("/prosumer");
            } else {
                res.status(400).send({ message: "failed to create a new user" });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }


    /**
     * Sign in as a user .
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async login(req, res) {
        try {
            const user = await User.findMany({email: req.body.email});
            if (user.length > 0 &&helper.comparePassword(req.body.password, user[0].password)) {
                const token = helper.generateToken(user[0]);
                req.session.token = token;
                res.redirect("/prosumer");
            } else {
                req.alert('danger', 'The email or password is incorrect, please try again.');
                return res.redirect("/prosumer/signin")
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send(err);
        }
    }


    /**
     * Update the users public profile page.
     *
     */
    async updateProfile(req, res) {
        try {
            
        } catch (err) {

        }
    }

    
    async updatePassword(req, res) {

    }
}


module.exports = UserController;
