
/***************************************************************************
 * The main server entry point.
 ***************************************************************************/


import Simulation from "./simulation";
import windapi from "./api/windapi";
import houseapi from "./api/houseapi";
import powerPlantApi from "./api/power-plantapi";
import process from "process";
import express from "express";


const app = express();
const port = process.env.PORT || 3000;


/**
 * Use declaration mapping to add extra 
 */
declare module 'express-serve-static-core' {
    interface Request {
        userId?: string
    }
}


//Allows get requests from http://localhost:3100.
app.use((req: express.Request, res: express.Response, next: any) => {
    // res.header('Access-Control-Allow-Methods', 'GET, POST')
    res.header("Access-Control-Allow-Origin", "http://localhost:3100");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept, User-Agent");
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

// Mount REST api route /api/house to houseapi
app.use('/api/house', houseapi);

// Mount REST api route /api/power-plant to power-plantapi
app.use('/api/power-plant', powerPlantApi);

// Start the simulator
let simulation = new Simulation();
simulation.restore();
//simulation.start();

// So the program will not close instantly
process.stdin.resume();

/**
 * Exit handler is used to stop and create checkpoint of simulation
 * before exiting the simulator server.
 */
function exitHandler(options: any, exitCode: any) {
    if (exitCode || exitCode === 0) {
        console.log('Simulator exited with code', exitCode);
    }
    if (options.exit) {
        simulation.stop(() => {
            process.exit();
        });
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
