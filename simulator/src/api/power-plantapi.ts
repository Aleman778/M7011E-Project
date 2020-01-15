
/***************************************************************************
 * REST API for the power plant simulator
 ***************************************************************************/


import express from "express";
import PowerPlant from "../models/power-plant";
import Simulation from "../simulation";
import ensureAuthenticated from "./auth";
import { ElectricityGridDB, eq } from "../database";
import * as utils from "./utils";
var router = express.Router();


/**
 * Get the power plant of the current logged in user.
 */
router.get('/my', ensureAuthenticated('manager'), (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            return res.status(200).json(state.powerPlants[req.userId]);
        }
    } catch(err) {
        console.trace(err);
        console.log("[Power PlantAPI] Failed to find a requested power plant with id " + req.userId + ".");
    }
    return res.status(400).send("Whoops! We failed to find your power plant, please try again later.");
});


/**
 * Register new power plant for a signed up manager.
 */
router.post('/my', ensureAuthenticated('manager'), async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            let plant = PowerPlant.generate(req.userId, "");
            await ElectricityGridDB.table('power_plant').insert(plant.data);
            state.powerPlants[plant.owner] = plant;
            return res.status(200).send("You power plant has been registered successfully.");
        }
    } catch(err) {
        console.trace(err);
        await ElectricityGridDB.table('power_plant').remove([eq('owner', req.userId)]);
        console.log("[Power PlantAPI] Failed to register power plant, removing possible broken traces in database.");
    }
    return res.status(400).send("Whoops! We failed to register your power plant, please try again later.");
});


/**
 * Delete the power plant from the simulation.
 */
router.delete('/my', ensureAuthenticated('manager'), async (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            await ElectricityGridDB.table('power_plant').remove([eq('owner', req.userId)]);
            delete state.powerPlants[req.userId];
            return res.status(200).send("Your power plant was deleted successfully.");
        }
    } catch(err) {
        console.trace(err);
    }
    return res.status(400).send("Whoops! We failed to delete your power plant, please try again later.");
});


/**
 * Get the power plants markets suggested price.
 */
router.get('/market/suggested-price', ensureAuthenticated('manager'), 
    (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            return res.status(200).json(state.powerPlants[req.userId].market.suggestedPrice);
        }
    } catch(err) {
        console.trace(err);
        console.log("[Power PlantAPI] Failed to find a requested power plant with id " + req.userId + ".");
    }
    return res.status(400).send("Whoops! We failed to find your power plant, please try again later.");
});

export = router;
