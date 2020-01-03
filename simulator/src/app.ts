
/***************************************************************************
 * The main server entry point.
 ***************************************************************************/


import Simulator from "./simulation";
import windapi from "./api/windapi";
import express from "express";
const app = express();
const port = process.env.PORT || 3000;


//Allows get requests from http://localhost:3100.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3100');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Adds support for input from POST requests
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Start the server
app.listen(port);

// Mount REST api route /api/wind to windapi
app.use('/api/wind', windapi);


// Start the simulator
var simulator = new Simulator();
simulator.restore();
simulator.start(1000 * 10);
