
/***************************************************************************
 * REST API for the wind simulator.
 ***************************************************************************/


import express from "express";
import Simulation from "../simulation";
import * as utils from "./utils";
import { QueryBuilder } from "../query-builder";
import { ClimateDB, eq, le, ge } from "../models/database";
var router = express.Router();


/**
 * Get the interpolated wind speed of the currently running
 * simulation instance.
 */
router.get('/', async (req, res) => {
    try {
        let sim = Simulation.getInstance();
        let result = await sim.state?.wind.getSpeed(sim.time);
        res.json(result);
    } catch (err) {
        console.trace(err);
        res.status(400).send("There is an error in the request");
    }
});


/**
 * Get the interpolated wind speeds at a given timestamp
 */
router.get('/at/:timestamp', async (req, res) => {
    try {
        let sim = Simulation.getInstance();
        let timestamp = new Date(req.params.timestamp);
        let result = await sim.state?.wind.getSpeed(sim.time);
        res.json(result);
    } catch (err) {
        console.trace(err);
        res.status(400).send("There is an error in the request");
    }
});


/**
 * Get all recoreded wind speeds.
 */
router.get('/all', async (req, res) => {
    try {
        let builder = new QueryBuilder();
        let params: any[] = [];
        builder.select('wind_data', []);
        utils.filterQuery(req, params, builder);
        console.log(builder.toString());
        let { rows } = await ClimateDB.query(builder.toString(), params);
        res.json(rows);
    } catch (err) {
        console.trace(err);
        res.status(400).send("There is an error in the request");
    }
});


/**
 * Get all recoreded wind speeds before the given timestamp.
 */
router.get('/time/:op/:timestamp', async (req, res) => {
    try {
        let builder = new QueryBuilder();
        let params: any[] = [utils.operator(req.params.op), req.params.timestamp];
        
        builder.select('wind_data', [])
            .where([{col: 'time'}]);
        utils.filterQuery(req, params, builder);
        console.log(builder.toString());
        let { rows } = await ClimateDB.query(builder.toString(), params);
        res.json(rows);
    } catch (err) {
        console.trace(err);
        res.status(400).send("There is an error in the request");
    }
});


export = router;
