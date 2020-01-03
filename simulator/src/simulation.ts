
/***************************************************************************
 * The main simulator application.
 ***************************************************************************/


import SimulationState from "./models/state";
import { incrTime } from "./models/utils";


/**
 * The simulator class is responsible for updating the
 * simulation state at every time step. The simulation
 * can be stored in a database and restored when restarting.
 * The simulator also keeps track of the time and date.
 */
export default class Simulation {
    /**
     * The currently running simulator.
     */
    private static instance?: Simulation;
    
    /**
     * The simulation state.
     */
    public state?: SimulationState;
    
    /**
     * The current simulation time.
     */
    private _time: Date;

    /**
     * The number of microseconds until next simulation step.
     */
    private _deltaTime: number;

    /**
     * The time when simulation should end if simulation is not endless.
     */
    private stopTime: Date;
        
    /**
     * Should time be updated to match the real time now?
     */
    private timeNow: boolean;
    
    /**
     * Should the simulation run forever?
     */
    private endless: boolean;
    
    /**
     * The step function timer, "infinite loop".
     */
    private stepTimer: any;

    
    /**
     * Creates a new simulation with optional parameters.
     * @param {number} deltaTime the number of milliseconds between each simulation step
     * @param {Date} startTime the time at which the simulator starts at,
     *        if set to null the simulator always uses current date.
     */
    constructor(deltaTime:number = 1000, startTime?:Date) {
        this._deltaTime = deltaTime;
        this.timeNow = (startTime == undefined);
        this._time = startTime || new Date();
        this.stopTime = startTime || new Date();
        this.endless = true;
    }


    /**
     * Get the currently running simulation.
     */
    static getInstance(): Simulation {
        if (!Simulation.instance) {
            throw new Error("There is currently no running simulation.");
        }
        return Simulation.instance;
    }


    /**
     * Restore the previous simulation session from database.
     * This is only required when starting up.
     */
    restore() {
        
    }


    /**
     * Runs the simulation in an "infinite loop".
     * The simulation lifetime is endless but can be changed.
     * @param {number} lifetime the number of milliseconds to run for
     */
    start(lifetime?: number) {
        Simulation.instance = this;
        this.state = SimulationState.generate();
        if (lifetime != null) {
            this.stopTime = incrTime(this._time, lifetime);
            this.endless = false;
        }
        this.stepTimer = setInterval(() => {
            this.step()
        }, this._deltaTime);
    }


    /**
     * Immediately stops the simulation.
     */
    stop() {
        Simulation.instance = undefined;
        clearInterval(this.stepTimer);
    }


    /**
     * Getter for the current simulation time.
     * @returns {number} the time
     */
    get time(): Date {
        return this._time;
    }


    /**
     * Getter for the delta time of the simulation.
     * Delta time is the number of milliseconds between two
     * consecutive simulation steps.
     * @returns {number} the delta time
     */
    get deltaTime(): number {
        return this._deltaTime;
    }
    
    
    /**
     * Step event is called for each time the simulation should
     * update the state and progress the time.
     */
    private step() {
        this.updateTime();
        if (this.shouldStop()) {
            return this.stop();
        }

        if (this.state) {
            this.state.update(this);
        }
        // this.checkpoint();
    }

    
    /**
     * Checkpoint event is called for each time the simulation
     * should store the state in the database. This should not
     * progress the time, the step function does that.
     */
    private checkpoint() {
        if (this.shouldStop()) {
            return;
        }
        console.log("Checkpoint at " + this._time);
    }

    
    /**
     * Check if the simulation should stop if
     * the simulation has a lifetime from in run(lifetime).
     */
    private shouldStop() {
        if (!this.endless && this._time > this.stopTime) {
            return true;
        } else {
            return false;
        }
    }

    
    /**
     * Update the current simulation time.
     * If timeNow is set update accoding to Date.now().
     */
    private updateTime() {
        if (this.timeNow) {
            this._time = new Date();
        } else {
            this._time = incrTime(this._time, this._deltaTime);
        }
    }
}
