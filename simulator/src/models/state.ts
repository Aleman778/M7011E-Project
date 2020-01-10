
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
     * All the houses models in this state.
     */
    public houses: House[];
    
    
    /**
     * Creats a new simulation state.
     * @param {Wind} wind the wind main wind object
     */
    constructor(wind: Wind) {
        this.wind = wind;
        this.houses = [];
    }


    /**
     * Generate a new simulation using random parameters.
     * These random variables are checked to be somewhat realistic.
     * @returns {SimulationState} the generated state
     */
    static generate(): SimulationState {
        let wind = Wind.generate();
        return new SimulationState(wind);
    }
    

    /**
     * Restore the simulation state from previous checkpoint
     * stored in the database.
     * @returns {Promise<SimulationState>} the restored state
     */
    static async restore(): Promise<SimulationState> {
        try {
            let wind = await Wind.findById(0);
            return new SimulationState(wind);
        } catch(err) {
            console.log("[SimulationState] Failed to restore from previous checkpoint");
            console.log("[SimulationState] Generating new simulation state...");
            return SimulationState.generate();
        }
    }

    
    /**
     * Update the simulation state variables.
     * @param {Simulation} sim the simulation instance
     */
    async update(sim: Simulation) {
        this.wind.update(sim);
        for (let i in this.houses) {
            this.houses[i].update(sim);
        }
    }


    /**
     * Store the simulation state variables onto database.
     * @param {Simulation} sim the simulation instance
     */
    async store(sim: Simulation) {
        await this.wind.store();
        for (let i in this.houses) {
            this.houses[i].store();
        }
    }
}
