
/***************************************************************************
 * The manager controller handles different actions specific to the
 * manager role and also inherits base actions from the user controller.
 ***************************************************************************/

var UserController = require('./user-controller');
var Manager = require('../models/manager');
var User = require('../models/user');
var helper = require('../models/helper');
const db = require('../db');


/**
 * The different settings page.
 */
const settingsPages = ['profile', 'account', 'security'];


/**
 * The manager controller defines different actions that
 * the manager user can perform. This inherts from user
 * controller that already defines some basic common actions.
 */
class ManagerController extends UserController {
    /**
     * Creates a new manager controller.
     */
    contructor() { }
    

    /**
     * Sign in a manager.
     */
    async signin(req, res) {
        try {
            if (await super.signin(req, res, 'manager')) {
                if (req.session.redirectTo) {
                    let url = req.session.redirectTo;
                    req.session.redirectTo = undefined;
                    return res.redirect(url);
                } else {
                    return res.redirect('/manager');
                }
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.status(401).render('manager/signin', {alerts: req.alert()});
    }


    /**
     * Sign up a manager.
     */
    async signup(req, res) {
        var model = new Manager({name: req.body.name, email: req.body.email});
        try {
            if (await super.signup(req, res, model, 'manager')) {
                return res.redirect('/manager');
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.status(400).render('manager/signup', {alerts: req.alert()});

    }

    
    /**
     * Updates the manager public profile settings.
     */
    async updateProfile(req, res) {
        try {
            if (await super.updateProfile(req, res)) {
                req.success('Your profile settings have been updated.');
            }
        } catch (err) {
            req.whoops();
            console.trace(err);
        }
        return res.redirect('/manager/settings/profile');
    }


    /**
     * Uploads a new avatar image, should replace the old.
     */
    async updateAvatar(req, res) {
        if (await super.updateAvatar(req, res)) {
            req.success('Your profile picture have been updated.');
            res = res.status(200);
        } else {
            res = res.status(400);
        }
        return res.render('partials/alerts', {alerts: req.alert()});
    }


    /**
     * Revert to using the gravatar profile picture instead.
     */
    async revertToGravatar(req, res) {
        if (await super.revertToGravatar(req, res)) {
            req.success('Your profile picture have been updated.');
        }
        return res.redirect('/manager/settings/profile');
    }

    
    /**
     * Update the manager password.
     */
    async updatePassword(req, res) {
        try {
            if (await super.updatePassword(req, res)) {
                req.success('Your password have been updated.');
            }
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/settings/security');
    }
        

    /**
     * Show the logged in managers dashboard.
     * Should provide an auth.verify middleware for accessing this.
     */
    async dashboard(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            res.render('manager/dashboard', {user: manager});
        } catch(err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/manager/signin');
        }
    }
    

    /**
     * Show a managers settings view.
     * Should provide an auth middleware for accessing this.
     */
    async settings(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            var page = (req.params.page || settingsPages[0]).toString();
            var pageIndex = settingsPages.indexOf(page);
            if (pageIndex == -1) {
                page = settingsPages[0];
                pageIndex = 0;
            }
            return res.render(
                'manager/settings',
                {
                    user: manager,
                    alerts: req.alert(),
                    page: page,
                    pageIndex: pageIndex,
                }
            );
        } catch(err) {
            console.trace(err);
            return res.status(400).send(err);
        }
    }


    /**
     * Show the logged in managers prosumers page.
     * Should provide an auth.verify middleware for accessing this.
     */
    async listProsumers(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            let prosumers = [];
            let { rows }  = await db.select('users', {role: 'prosumer'});
            rows.forEach(function(data) {
                prosumers.push(new User(data));
            });
            console.log(prosumers);

            res.render('manager/prosumers', {user: manager, prosumers: JSON.stringify(prosumers)});
        } catch(err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/manager/signin');
        }
    }
}


/**
 * Expose the manager controller instance.
 */
module.exports = new ManagerController();
