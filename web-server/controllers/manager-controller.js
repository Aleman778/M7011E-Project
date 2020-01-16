
/***************************************************************************
 * The manager controller handles different actions specific to the
 * manager role and also inherits base actions from the user controller.
 ***************************************************************************/

var UserController = require('./user-controller');
var Manager = require('../models/manager');
var Prosumer = require('../models/prosumer');
var User = require('../models/user');
var helper = require('../models/helper');
const db = require('../db');
const fetch = require('node-fetch');


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
                const response = await fetch(`http://simulator:3000/api/power-plant/my`, {
                    method: 'post',
                    headers: {'Authorization': 'Bearer ' + req.session.token},
                    body: JSON.stringify({name: req.body.name})
                });
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
            manager.online();
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
            manager.online();
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
            manager.online();

            let prosumers = [];
            let { rows }  = await db.select('users', {role: 'prosumer'});
            rows.forEach(function(data) {
                prosumers.push(new User(data));
            });

            res.render('manager/prosumers', {user: manager, prosumers: prosumers});
        } catch(err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/manager/signin');
        }
    }


    /**
     * Show the logged in manager the power plant control panel.
     * Should provide an auth.verify middleware for accessing this.
     */
    async controlPanel(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();
            res.render('manager/coal-power-plant-control-panel', {user: manager});
        } catch(err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/manager/signin');
        }
    }


    /**
     * Remove prosumer account.
     * Should provide an auth.verify middleware for accessing this.
     */
    async removeProsumer(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            let queryText = 'UPDATE users SET removed = $1 WHERE id = $2 AND role = $3;';
            let params = [true, req.body.prosumerId, "prosumer"];
            db.query(queryText, params);
            /**
             * @TODO Remove prosumer from simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/prosumers');
    }


    /**
     * Block prosumer from selling to the market.
     * Should provide an auth.verify middleware for accessing this.
     */
    async blockProsumer(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            console.log(req.body.timeout);
            /**
             * @TODO Block prosumer in simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/prosumers');
    }


    /**
     * View prosumers info page.
     * Should provide an auth.verify middleware for accessing this.
     */
    async prosumerInfo(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.body.prosumerId});
            const manager = await Manager.findOne({id: req.userId});
            manager.online();
            res.render('manager/prosumer-info', {user: manager, prosumer: prosumer});
        } catch (err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/manager/prosumers');
        }
    }


    /**
     * Get prosumers info.
     * Should provide an auth.verify middleware for accessing this.
     */
    async getProsumers(req, res) {
        try {
            let prosumers = [];
            let { rows }  = await db.select('users', {role: 'prosumer'});
            rows.forEach(function(data) {
                prosumers.push(new Prosumer(data));
            });

            res.send(JSON.stringify(prosumers));
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
    }


    /**
     * Get prosumer info.
     * Should provide an auth.verify middleware for accessing this.
     */
    async getProsumer(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.body.prosumerId});
            res.send(JSON.stringify(prosumer));
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
    }


    /**
     * Gets a prosumers latest production data.
     */
    async getCurrentProductionData(req, res) {
        try {
            const response = await fetch(`http://simulator:3000/simulator/prosumer/${req.body.prosumerId}`);
            const prosumerData = await response.json();
            res.send(JSON.stringify(prosumerData));
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
    }


    /**
     * Gets a prosumers historical production data.
     */
    async getHistoricalProductionData(req, res) {
        try {
            const response = await fetch(`http://simulator:3000/simulator/prosumer/history/latest/${req.body.prosumerId}`);
            const prosumerHistoricalData = await response.json();
            res.send(JSON.stringify(prosumerHistoricalData));
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
    }
}


/**
 * Expose the manager controller instance.
 */
module.exports = new ManagerController();
