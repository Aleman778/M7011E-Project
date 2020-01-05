
/***************************************************************************
 * The simulation state holds all the models relevant for this simulation.
 ***************************************************************************/

import Wind from "./wind";
import House from "./house";
import Simulation from "../simulation";


/**
 * The simuation state holds all models active in
 * the running simulation. 
 */
export default class SimulationState {
    /**
     * The main wind model.
     */
    public wind: Wind;

    /**
     * All the house models in this state.
     */
    public house: House[];
    
    
    /**
     * Creats a new simulation state.
     * @param {Wind} wind the wind main wind object
     */
    constructor(wind: Wind) {
        this.wind = wind;
        this.house = [];
    }


    /**
     * Generate a new simulation using random parameters.
     * These random variables are checked to be somewhat realistic.
     * @returns {SimulationState} the generated state
     */
    static generate(): SimulationState {
        let max = Math.random() * 20 + 5;
        let stdev = Math.random() * 10 + 1;
        let wind = new Wind(max, stdev, "m/s");
        return new SimulationState(wind);
    }


    /**
     * Restore the simulation state from previous checkpoint
     * stored in the database.
     * @returns {Promise<SimulationState>} the restored state
     */
    static async restore(): Promise<SimulationState> {
        let wind = await Wind.findById(0);
        return new SimulationState(wind);
    }

    
    /**
     * Update the simulation state variables.
     * @param {Simulation} sim the simulation instance
     */
    update(sim: Simulation) {
        this.wind.update(sim);
    }


    /**
     * Store the simulation state variables onto database.
     * @param {Simulation} sim the simulation instance
     */
    async store(sim: Simulation) {
        await this.wind.store();
    }
}
