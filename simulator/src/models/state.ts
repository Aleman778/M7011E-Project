
/***************************************************************************
 * The simulation state holds all the models relevant for this simulation.
 ***************************************************************************/

import Wind from "./wind";
import Simulator from "../simulation";


/**
 * The simuation state holds all models active in
 * the running simulation. 
 */
export default class SimulationState {
    public wind: Wind;
    
    constructor(wind: Wind) {
        this.wind = wind;
    }


    /**
     * Generate a new simulation using random parameters.
     * These random variables are checked to be somewhat realistic.
     */
    static generate(): SimulationState {
        let max = Math.random() * 20 + 5;
        let stdev = Math.random() * 10 + 1;
        let wind = new Wind(max, stdev);
        return new SimulationState(wind);
    }

    
    /**
     * Update the simulation state variables.
     */
    update() {
        this.wind.update();
    }
}
