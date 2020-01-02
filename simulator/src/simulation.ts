
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
    public time: Date;
    
    /**
     * The time when simulation should end if simulation is not endless.
     */
    private stopTime: Date;
    
    /**
     * The number of microseconds until next simulation step.
     */
    private stepSize: number;
    
    /**
     * Should the simulation run forever.
     */
    endless: boolean;
    
    /**
     * The step function timer, "infinite loop".
     */
    stepTimer: any;
    
    /**
     * Creates a new simulation with optional parameters.
     * @param {number} stepSize the number of milliseconds until next step
     * @param {Date} startTime the time at which the simulator starts at,
     *        if set to null the simulator always uses current date.
     */
    constructor(stepSize:number = 1000, startTime:Date = new Date()) {
        this.stepSize = stepSize;
        this.time = startTime;
        this.stopTime = startTime;
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
        if (lifetime != null) {
            this.stopTime = incrTime(this.time, lifetime);
            this.endless = false;
        }
        this.state = SimulationState.generate();
        this.stepTimer = setInterval(() => {
            this._step()
        }, this.stepSize);
    }


    /**
     * Immediately stops the simulation.
     */
    stop() {
        Simulation.instance = undefined;
        clearInterval(this.stepTimer);
    }
    

    /**
     * Step event is called for each time the simulation should
     * update the state and progress the time.
     */
    _step() {
        this.time = incrTime(this.time, this.stepSize);
        if (this._shouldStop()) {
            return this.stop();
        }

        if (this.state) {
            this.state.update();
        }
        console.log("Step at " + this.time);
        // this._checkpoint();
    }

    
    /**
     * Checkpoint event is called for each time the simulation
     * should store the state in the database. This should not
     * progress the time, the step function does that.
     */
    _checkpoint() {
        if (this._shouldStop()) {
            return;
        }
        console.log("Checkpoint at " + this.time);
    }

    
    /**
     * Check if the simulation should stop if
     * the simulation has a lifetime from in run(lifetime).
     */
    _shouldStop() {
        if (!this.endless && this.time > this.stopTime) {
            return true;
        } else {
            return false;
        }
    }
}
