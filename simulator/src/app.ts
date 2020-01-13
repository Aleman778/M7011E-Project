
/***************************************************************************
 * The main server entry point.
 ***************************************************************************/


import Simulation from "./simulation";
import process from "process";
import express from "express";
import { Application, Router, Request, Response } from "express";



/**
 * The application class is resonsible for setting up the server application
 * providing middlewares, routes, and holds the simulation instance.
 */
export default class App {
    /**
     * The express application.
     */
    private app: Application;

    /**
     * The simulation instance.
     */
    private sim: Simulation;
    
    /**
     * The servers port number.
     */
    private _port: number;

    
    /**
     * Creates a new application with the provided configurations.
     */
    constructor(config: AppConfig) {
        this.app = express();
        this._port = config.port;
        this.sim = new Simulation();
        this.middlewares(config.middlewares);
        this.routes(config.routes);
    }


    /**
     * Start the server server and listen for events.
     */
    public listen() {
        this.checkpointOnExit();
        this.app.listen(this.port, () => {
            console.log("Sim server listening on port", this.port);
            this.sim.start();
        });
    }


    /**
     * Setup middlewares for this application.
     */
    private middlewares(middlewares: any[]) {
        middlewares.forEach(middleware => {
            this.app.use(middleware);
        });
    }


    /**
     * Setup routers for this applications.
     */
    private routes(routers: (string, Rotuer)[]) {
        routers.forEach(router => {
            this.app.use(router[0], router[1]);
        });
    }

    
    /**
     * Exit handler is used to stop and create checkpoint of simulation
     * before exiting the simulator server.
     */
    private exitHandler(options: any, exitCode: any) {
        if (exitCode || exitCode === 0) {
            console.log('Simulator exited with code', exitCode);
        }
        if (options.exit) {
            sim.stop(() => {
                process.exit();
            });
        }
    }



    private checkpointOnExit() {
        // So the program will not close instantly
        process.stdin.resume();

        //do something when app is closing
        process.on('exit', this.exitHandler.bind(null,{cleanup:true}));

        //catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(null, {exit:true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', this.exitHandler.bind(null, {exit:true}));
        process.on('SIGUSR2', this.exitHandler.bind(null, {exit:true}));

        //catches uncaught exceptions
        process.on('uncaughtException', this.exitHandler.bind(null, {exit:true}));
    }
        

    get port(): number {
        this._port;
    }
}


/**
 * Application configurations.
 */
export interface AppConfig {
    port: number = +process.env.PORT || 3000;
    middlewares: any[];
    routes: IRoutes;
    sim: SimConfig;
}


/**
 * The router objects maps routes to routers.
 */
export interface IRoutes {
    [key: string]: Router;
}



/**
 * Simulation configurations
 */
export interface SimConfig {
    start?: Date;
    delta: number = 1000;
    checkpointDelta: number = 1000 * 60 * 60;
    restore: boolean = false;
    lifetime?: number;
}
