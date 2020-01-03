
/***************************************************************************
 * REST API for the wind simulator.
 ***************************************************************************/


import express from "express";
import Simulation from "../simulation";
var router = express.Router();


/**
 * Get the wind speed of the currently running
 * simulation instance.
 */
router.get('/', (req, res) => {
    let sim = Simulation.getInstance();
    res.send(sim?.state?.wind);
});


export = router;
