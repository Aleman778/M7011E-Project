
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


const UserController = require('./user-controller');
const User = require('../models/user');
const helper = require('../models/helper');


/**
 * The different settings page.
 */
const settingsPages = ['profile', 'account', 'security', 'notifications'];


/**
 * The prosumer controller handles all the actions that a prosumer does
 * such as login, signup etc.
 */
class ProsumerController extends UserController {
    /**
     * Creates a new prosumer controller.
     */
    constructor() {
        super();
    }


    /**
     * Sign up as a prosumer.
     */
    async signup(req, res) {
        try {
            if (await super.signup(req, res, 'prosumer')) {
                return res.redirect('/prosumer');
            } else {
                return res.redirect('/prosumer/signin');
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send(err);
        }
    }
    

    /**
     * Sign in as a prosumer. 
     */
    async signin(req, res) {
        try {
            if (await super.signin(req, res, 'prosumer')) {
                return res.redirect('/prosumer');
            } else {
                return res.redirect('/prosumer/signin');
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send(err);
        }
    }

    
    /**
     * Updates the prosumer public profile settings.
     */
    async updateProfile(req, res) {
        try {
            if (await super.updateProfile(req, res)) {
                req.alert('success', 'Your profile settings have been updated.');
            } else {
                req.alert('danger', 'Your profile could not be updated, please try again later.');
            }
            return res.redirect('/prosumer/settings/profile');
        } catch (err) {
            req.alert('danger', 'Oh no! Something unexpected happened, please try again later.');
            console.log(err);
        }
    }


    /**
     * Update the prosumer password.
     */
    async updatePassword(req, res) {
        try {
            if (await super.updatePassword(req, res)) {
                req.alert('success', 'Your password have been updated.');
            } else {
                req.alert('danger', 'Your password could not be updated, please try again later.');
            }
        } catch (err) {
            console.log(err);
            req.alert('danger', 'Oh no! Something unexpected happened, please try again later.');
        }
        return res.redirect('/prosumer/settings/security');
    }
    

    /**
     * Show a prosumers dashboard.
     * Should provide an auth middleware for accessing this.
     */
    async dashboard(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            res.render('prosumer/index', {user: user});
        } catch(err) {
            console.log(err);
            return res.send(400).send(err);
        }
    }


    /**
     * Show a prosumers settings view.
     * Should provide an auth middleware for accessing this.
     */
    async settings(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            var page = (req.params.page || settingsPages[0]).toString();
            var pageIndex = settingsPages.indexOf(page);
            if (pageIndex == -1) {
                page = settingsPages[0];
                pageIndex = 0;
            }
            return res.render(
                'prosumer/settings',
                {
                    user: user,
                    alerts: req.alert(),
                    page: page,
                    pageIndex: pageIndex,
                }
            );
        } catch(err) {
            console.log(err);
            return res.send(400).send(err);
        }
    }
    
    
    /**
     * Should provide an auth middleware for accessing this.
     */
   async overview(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            res.render('prosumer/overview', {user: user});
        } catch(err) {
            console.log(err);
            return res.send(400).send(err);
        }
    }
}


/**
 * Exports prosumer controller instance.
 */
module.exports = new ProsumerController();
