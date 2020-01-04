
/***************************************************************************
 * REST API for the wind simulator.
 ***************************************************************************/


import express from "express";
import Simulation from "../simulation";
import { ClimateDB, eq, le, ge } from "../models/database";
var router = express.Router();


/**
 * Get the wind speed of the currently running
 * simulation instance.
 */
router.get('/', async (req, res) => {
    let sim = Simulation.getInstance();
    let speed = await sim.state?.wind.getSpeed(sim.time);
    res.json(speed);
});


/**
 * Get all recoreded wind speeds.
 */
router.get('/all', async (req, res) => {
    let speeds = await ClimateDB.table('wind_data').select([]);
    res.json(speeds);
});


/**
 * Get the recoreded wind speeds at a given timestamp
 */
router.get('/at/:timestamp', async (req, res) => {
    let timestamp = new Date(req.params.timestamp);
    
    // let speed = await ClimateDB.table('wind_data').select([eq('time', timestamp)]);
    res.json(timestamp);
});


router.get('/before/:timestamp', async (req, res) => {

});


export = router;
