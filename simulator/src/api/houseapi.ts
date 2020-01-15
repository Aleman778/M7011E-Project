
/***************************************************************************
 * REST API for the house simulator.
 ***************************************************************************/

import express from "express";
import House from "../models/house";
import Simulation from "../simulation";
import ensureAuthenticated from "./auth";
import { ElectricityGridDB, eq } from "../database";
import * as utils from "./utils";
var router = express.Router();


/**
 * Get the house of the current logged in user.
 */
router.get('/my', ensureAuthenticated('prosumer'), (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            return res.status(200).json(state.houses[req.userId]);
        }
    } catch(err) {
        console.trace(err);
        console.log("[HouseAPI] Failed to find a requested house with id " + req.userId + ".");
    }
    return res.status(400).send("Whoops! We failed to find your house, please try again later.");
});



/**
 * Registera new house for a signed up prosumer.
 */
router.post('/my', ensureAuthenticated('prosumer'), async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            let house = House.generate(req.userId, true);
            await ElectricityGridDB.table('house').insert(house.data);
            if (house.turbine != undefined) {
                await ElectricityGridDB.table('wind_turbine').insert(house.turbine.data);
            }
            state.houses[house.owner] = house;
            return res.status(200).send("You house has been registered successfully.");
        }
    } catch(err) {
        console.trace(err);
        await ElectricityGridDB.table('house').remove([eq('owner', req.userId)]);
        await ElectricityGridDB.table('wind_turbine').remove([eq('owner', req.userId)]);
        console.log("[HouseAPI] Failed to register house, removing possible broken traces in database.");
    }
    return res.status(400).send("Whoops! We failed to register your house, please try again later.");
});


/**
 * Delete the house from the simulation.
 */
router.delete('/my', ensureAuthenticated('prosumer'), async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            await ElectricityGridDB.table('house').remove([eq('owner', req.userId)]);
            delete state.houses[req.userId];
            return res.status(200).send("Your house was deleted successfully.");
        }
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("Whoops! We failed to delete your house, please try again later.");
});


export = router;
