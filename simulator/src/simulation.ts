
/***************************************************************************
 * The main simulator application.
 ***************************************************************************/


import uuid from "uuid";
import SimulationState from "./models/state";
import { incrTime, HOUR_MILLISEC } from "./models/utils";
import { ClimateDB } from "./database";


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
     * The number of microseconds until next checkpoint.
     */
    private _checkpointDeltaTime: number;

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
     * The step function timer.
     */
    private stepTimer: any;
    
    /**
     * The checkpoint function timer.
     */
    private checkpointTimer: any;

    
    /**
     * Creates a new simulation with optional parameters.
     * @param {Date} startTime the time at which the simulator starts at,
     *        if set to null the simulator always uses current date
     * @param {number} deltaTime the number of milliseconds between each
     *        simulation step
     * @param {number} checkpointDeltaTime the number of milliseconds
     *        between each checkpoint
     */
    constructor(
        startTime?:Date,
        deltaTime:number = 1000,
        checkpointDeltaTime:number = 1000 * 60 * 10,
    ) {
        this._deltaTime = deltaTime;
        this._checkpointDeltaTime = checkpointDeltaTime;
        this._time = startTime || new Date();
        this.stopTime = startTime || new Date();
        this.timeNow = (startTime == undefined);
        this.endless = true;
    }


    /**
     * Get the currently running simulation.
     * @returns {Simulation} the current simulation running
     */
    static getInstance(): Simulation {
        if (Simulation.instance == undefined) {
            throw new Error("There is currently no running simulation.");
        }
        return Simulation.instance;
    }


    /**
     * Get the state of the current simulation.
     * @returns {SimulationState} the simulation state
     */
    static getState(): SimulationState {
        let sim = Simulation.getInstance();
        if (sim.state == undefined) {
            throw new Error("There is currently no created simulation state.");
        }
        return sim.state;
    }
    

    /**
     * Restore the previous simulation checkpoint from database.
     * This continues the simulation so there is no need to run start() after.
     * @param {string} id the simulation state uuid
     * @param {number} lifetime optionally the number of milliseconds to run for
     */
    restore(lifetime?: number) {
        if (Simulation.instance == this)
            throw Error("This simulation is already running cannot run it twice");

        Simulation.instance = this;
        SimulationState.restore().then((state) => {
            console.log('[Simulation] Recovered from previous checkpoint');
            this.state = state;
            this.run(lifetime);
        });
    }


    /**
     * Runs the simulation in an "infinite loop".
     * The simulation lifetime is endless but can be changed.
     * @param {string} id optionally the simulation state uuid
     * @param {number} lifetime optionally the number of milliseconds to run for
     */
    start(lifetime?: number) {
        if (Simulation.instance == this)
            throw Error("This simulation is already running cannot run it twice");
        
        Simulation.instance = this;
        if (this.state == undefined) {
            this.state = SimulationState.generate();
        }
        
        this.run(lifetime);
    }


    /**
     * Immediately stops the simulation.
     */
    stop(callback?: () => void) {
        this.checkpoint().then(() => {
            Simulation.instance = undefined;
            clearInterval(this.stepTimer);
            clearInterval(this.checkpointTimer);
            console.log('[Simulation] Simulation stopped at', this._time.toUTCString());

            ClimateDB.getInstance().end().then(() => {
                if (callback != undefined) {
                    callback();
                }
            });
        });
    }


    /**
     * Start the step and checkpoint timers.
     * @param {number} lifetime optionally the number of milliseconds to run for
     */
    private run(lifetime?: number) {
        if (lifetime != undefined) {
            this.stopTime = incrTime(this._time, lifetime);
            this.endless = false;
        }
        this.stepTimer = setInterval(() => {
            this.step();
        }, this._deltaTime);
        this.checkpointTimer = setInterval(() => {
            this.checkpoint();
        }, this._checkpointDeltaTime);
        console.log('[Simulation] Simulation has started');
        this.step();
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
        this.state?.update(this);
    }

    
    /**
     * Checkpoint event is called for each time the simulation
     * should store the state in the database. This should not
     * progress the time, the step function does that.
     */
    private async checkpoint() {
        await this.state?.store(this);
        console.log('[Simulation] Checkpoint at', this._time.toUTCString());
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
    

    /**
     * Getter for the current simulation time.
     * @returns {Date} copy of current simulation time
     */
    get time(): Date {
        return new Date(this._time);
    }


    /**
     * Getter for the current simulation time floored to
     * the this hour, i.e. minutes, seconds and millisec is set to 0.
     * @returns {Date} copy of the current simulation time floored to hour
     */
    get timeHour(): Date {
        let time = new Date(this._time);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
        return time;
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
     * Get the delta time per hour basis i.e. `deltaTime / 1 hour`.
     * This is useful when calculating numbers based on deltaTime.
     * @returns {number} the delta hour time
     */
    get deltaHour(): number {
        return this.deltaTime / HOUR_MILLISEC;
    }

    
    /**
     * Getter for the checkpoint delta time of the simulation.
     * Checkpoint delta time is the number of milliseconds between two
     * consecutive simulation checkpoints.
     * @returns {number} the delta time
     */
    get checkpointDeltaTime(): number {
        return this._checkpointDeltaTime;
    }
}
