
/***************************************************************************
 * REST API for the house simulator.
 ***************************************************************************/

import express from "express";
import House from "../models/house";
import Simulation from "../simulation";
import * as utils from "./utils";
var router = express.Router();


/**
 * Get the house of the current logged in user.
 */
router.get('/current', (req, res) => {
    try {
        let sim = Simulation.getInstance();
        
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


/**
 * Create a new house for a signed up prosumer.
 */
router.post('/', (req, res) => {
    try {
        console.log(req.body);
        let sim = Simulation.getInstance();
        sim?.state?.houses.push(House.generate(req.body.id));
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


/**
 * Delete the house from the simulation.
 */
router.delete('/:userId', (req, res) => {
    try {
        let sim = Simulation.getInstance();
        
    } catch(err) {
        console.trace(err);
        res.status(400).send("There is an error in the request.");
    }
});


export = router;
