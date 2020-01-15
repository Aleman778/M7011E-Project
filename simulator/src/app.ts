
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
     * Should we restore simulation on start.
     */
    private restore: boolean;

    
    /**
     * Creates a new application with the provided configurations.
     */
    constructor(config: AppConfig) {
        this._port = config.port;
        this.restore = config.sim.restore;
        this.app = express();
        this.sim = new Simulation(config.sim.start,
                                  config.sim.delta,
                                  config.sim.checkpointDelta);
        this.middlewares(config.middlewares);
        this.routes(config.routes);
    }


    /**
     * Start the server server and listen for events.
     */
    public listen() {
        this.checkpointOnExit();
        this.app.listen(this.port, () => {
            console.log("[App] Simulation server listening on port", this.port);
            if (this.restore) {
                this.sim.restore();
            } else {
                this.sim.start();
            }
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
     * Setup routes for this applications.
     */
    private routes(routes: IRoutes) {
        for (let route in routes) {
            this.app.use(route, routes[route]);
        }
    }

    
    /**
     * Exit handler is used to stop and create checkpoint of simulation
     * before exiting the simulator server.
     */
    private exitHandler(options: any, exitCode: any) {
        if (exitCode || exitCode === 0) {
            console.log('[App] Simulation exited with code', exitCode);
        }
        if (options.exit) {
            this.sim.stop(() => {
                process.exit();
            });
        }
    }

    
    /**
     * Checkpoint when exiting the application to avoid losing the latest state.
     */
    private checkpointOnExit() {
        process.stdin.resume();
        process.on('exit',              this.exitHandler.bind(this, {cleanup: true}))
        process.on('SIGINT',            this.exitHandler.bind(this, {exit:    true}));
        process.on('SIGUSR1',           this.exitHandler.bind(this, {exit:    true}));
        process.on('SIGUSR2',           this.exitHandler.bind(this, {exit:    true}));
        process.on('uncaughtException', this.exitHandler.bind(this, {exit:    true}));
    }
        

    /**
     * Get the port number that the server is running on.
     * @returns {number} the port number
     */
    get port(): number {
        return this._port;
    }
}


/**
 * Application configurations.
 */
export interface AppConfig {
    port: number;
    middlewares: any;
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
    delta?: number;
    checkpointDelta?: number;
    restore: boolean;
    lifetime?: number;
}
