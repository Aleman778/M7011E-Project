
/***************************************************************************
 * The simulation server entry point 
 ***************************************************************************/

import App from "./app";
import Actor from "./models/actor";
import windapi from "./api/windapi";
import houseapi from "./api/houseapi";
import powerplantapi from "./api/power-plantapi"
import express from "express";
import { Request, Response, NextFunction } from "express";


/**
 * Use declaration mapping to add userId to request object.
 */
declare module 'express-serve-static-core' {
    interface Request {
        actor?: Actor;
    }
}


/**
 * Allow Cross-Origin Resource Sharing (CORS).
 */
function allowCORS(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin",
               "http://localhost:3100");
    res.header("Access-Control-Allow-Headers",
               "Authorization, Origin, X-Requested-With, Content-Type, Accept, User-Agent");
    next();
}


// Creates the application
const app = new App({
    port: 3000,
    middlewares: [
        express.urlencoded({extended: true}),
        express.json(),
        allowCORS
    ],
    routes: {
        '/api/wind': windapi,
        '/api/house': houseapi,
        '/api/power-plant': powerplantapi
    },
    sim: {
        restore: true,
    }
});


// Start the server
app.listen();
