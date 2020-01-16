/***************************************************************************
 * The power plant controller handles different actions specific to the
 * power plant.
 ***************************************************************************/


const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
var Manager = require('../models/manager');


/**
 * The power plant controller defines different actions that
 * be done to the power plant.
 */
class PowerPlantController {
    /**
     * Creates a new power plant controller.
     */
    contructor() {}
    

    /**
     * Starts the power plants production.
     */
    async start(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            const response = await fetch('http://simulator:3000/api/power-plant/start', {
                method: 'PUT',
                headers: {'Authorization': 'Bearer ' + req.session.token}
            });
            res.status(response.status);
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Stops the power plants production.
     */
    async stop(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            const response = await fetch('http://simulator:3000/api/power-plant/stop', {
                method: 'PUT',
                headers: {'Authorization': 'Bearer ' + req.session.token}
            });
            res.status(response.status);
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Update the power plants production level.
     */
    async updateLevel(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            const params = new URLSearchParams();
            params.append('newLevel', req.body.newLevel);
            const response = await fetch('http://simulator:3000/api/power-plant/production/level', {
                method: 'PUT',
                headers: {'Authorization': 'Bearer ' + req.session.token},
                body: params
            });
            res.status(response.status);
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Update the power plants production ratio.
     */
    async updateRatio(req, res) {
        try {
            const manager = await Manager.findOne({id: req.userId});
            manager.online();

            const params = new URLSearchParams();
            params.append('newRatio', req.body.newRatio/100);
            const response = await fetch('http://simulator:3000/api/power-plant/market-ratio', {
                method: 'PUT',
                headers: {'Authorization': 'Bearer ' + req.session.token},
                body: params
            });
            res.status(response.status);
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Get current power plant status.
     */
    async getPowerPlant(req, res) {
        try {
            const response = await fetch('http://simulator:3000/api/power-plant', {
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + req.session.token}
            });
            const powerPlantData = await response.json();
            res.send(JSON.stringify(powerPlantData));
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
    }
}


/**
 * Expose the power plant controller instance.
 */
module.exports = new PowerPlantController();
