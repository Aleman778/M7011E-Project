
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
router.get('/my', ensureAuthenticated, (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            res.status(200).json(state.houses[req.userId]);
        }
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("There is an error in the request.");
});


/**
 * Create a new house for a signed up prosumer.
 */
router.post('/my', ensureAuthenticated, async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            let house = House.generate(req.userId, true);
            await ElectricityGridDB.table('house').insert(house.data);
            state.houses[house.owner] = house;
            return res.status(200).send("You house has been constructed successfully.");
        }
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("There is an error in the request.");
});


/**
 * Delete the house from the simulation.
 */
router.delete('/my', ensureAuthenticated, async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            await ElectricityGridDB.table('house').remove([eq('owner', req.userId)]);
            delete state.houses[req.userId];
            res.status(200).send("Your house was deleted successfully.");
        }
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("There is an error in the request.");
});


export = router;
