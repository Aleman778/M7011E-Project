
/***************************************************************************
 * REST API for the house simulator.
 ***************************************************************************/

import express from "express";
import House from "../models/house";
import Simulation from "../simulation";
import { User, ensureAuthenticated } from "./auth";
import { ElectricityGridDB, eq } from "../database";
import * as utils from "./utils";
var router = express.Router();


/**
 * Get the house of the current logged in user.
 */
router.get('/my', ensureAuthenticated, (req, res) => {
    try {
        let state = Simulation.getState();
        let user: User = req.body.user;
        console.log();
        res.status(200).json(state.houses[user.id]);
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


/**
 * Create a new house for a signed up prosumer.
 */
router.post('/my', ensureAuthenticated, async (req, res) => {
    try {
        let state = Simulation.getState();
        let house = House.generate(req.body.user.ud, true);
        await ElectricityGridDB.table('house').insert(house.data);
        state.houses[house.owner] = house;
        res.status(200).send("You house has been constructed successfully.");
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


/**
 * Delete the house from the simulation.
 */
router.delete('/my', ensureAuthenticated, async (req, res) => {
    try {
        let state = Simulation.getState();
        let uid = req.body.user.id;
        await ElectricityGridDB.table('house').remove([eq('owner', uid)]);
        delete state.houses[uid];
        res.status(200).send("Your house was deleted successfully.");
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


export = router;
