
/***************************************************************************
 * REST API for the house simulator.
 ***************************************************************************/

import express from "express";
import House from "../models/house";
import Simulation from "../simulation";
import authenticate from "./auth";
import { ElectricityGridDB, eq } from "../database";
import { Request, Response } from "express";
import * as utils from "./utils";
var router = express.Router();


/**
 * Get the state of a house, requires user to be authenticated
 * For prosumers: 
 *     - you can only get your own house.
 * For managers:
 *     - you can view anyones house by quering  ?uuid=...
 */
router.get('/', authenticate(), (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let state = Simulation.getState();
        if (req.actor.role == 'prosumer') {
            let house = state.houses[req.actor.id];
            return res.status(200).json(house.out());
        } else if (req.actor.role == 'manager') {
            if (req.query.uuid != undefined) {
                let house = state.houses[req.query.uuid];
                return res.status(200).json(house.out());
            }
        } else {
            return res.status(400).send("Permission denied! Only accessable by prosumers and managers.");
        }
    } catch(err) {
        console.trace(err);
        console.log("[HouseAPI] Failed to find a requested house with id " + req.actor.id + ".");
    }
    return res.status(400).send("Whoops! We failed to find requested house, please try again later.");
});


/**
 * Gets the state of all houses registered in the simulation,
 * that belongs to the autenticated prosumer.
 */
router.get('/list', authenticate('manager'), (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let state = Simulation.getState();
        let result = [];
        for (let uuid in state.houses) {
            let house = state.houses[uuid];
            if (house.powerPlant?.owner == req.actor.id) {
                result.push(house.out());
            }
        }
        res.send(200).json(result);
    } catch(err) {
        console.trace(err);
        console.log("[HouseAPI] Failed to list all the prosumers houses connected to power-plant with id", req.actor.id);
    }
    return res.status(400).send("Whoops! We failed to find requested houses, please try again later.");
});

router.post('/block', authenticate('manager'), (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");

});


/**
 * Registera new house for a signed up prosumer.
 */
router.post('/', authenticate('prosumer'), async (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let sim = Simulation.getInstance();
        let state = Simulation.getState();
        let house = House.generate(req.actor.id, true);
        state.houses[house.owner] = house;
        await house.store(sim);
        return res.status(200).send("You house has been registered successfully.");
    } catch(err) {
        console.trace(err);
        await ElectricityGridDB.table('house').remove([eq('owner', req.actor.id)]);
        await ElectricityGridDB.table('wind_turbine').remove([eq('owner', req.actor.id)]);
        console.log("[HouseAPI] Failed to register house, removing possible broken traces in database.");
    }
    return res.status(400).send("Whoops! We failed to register your house, please try again later.");
});


/**
 * Make changes to the house settings e.g. change battery/ ratios.
 * Only possible for authenticated prosumers.
 */
router.put('/', authenticate('prosumer'), async (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let sim = Simulation.getInstance();
        let state = Simulation.getState();
        let house = state.houses[req.actor.id];
        if (house != undefined) {
            if (req.body.batteryCapacity != undefined && house.battery != undefined) {
                house.battery.capacity = req.body.batteryCapacity;
            }
            
            if (req.body.chargeRatio != undefined) {
                house.chargeRatio = req.body.chargeRatio;
            }
            if (req.body.consumeRatio != undefined) {
                house.consumeRatio = req.body.consumeRatio;
            }
            house.store(sim);
        } else {
            return res.status(400).send("Whoops! We could not find your house, please try again later.");
        }
    } catch(err) {
        console.trace(err);
        console.log("[ProsumerAPI] Failed to update prosumer settings with id =", req.actor.id);
        return res.status(400).send(err);
    }
    return res.status(400).send("Whoops! We failed to update your settings, please try again later.");
});



/**
 * Delete the house from the simulation.
 */
router.delete('/', authenticate('prosumer'), async (req, res) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let state = Simulation.getState();
        await ElectricityGridDB.table('house').remove([eq('owner', req.actor.id)]);
        await ElectricityGridDB.table('wind_turbine').remove([eq('owner', req.actor.id)]);
        delete state.houses[req.actor.id];
        return res.status(200).send("Your house was deleted successfully.");
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("Whoops! We failed to delete your house, please try again later.");
});


export = router;
