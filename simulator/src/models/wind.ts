
/***************************************************************************
 * The wind model holds the neccessary parameters and wind data.
 ***************************************************************************/


import Simulation from "../simulation";
import { gaussian, shuffle } from "./utils";


/**
 * The wind model holds the parametes and model used to generate wind data.
 * Different wind models can be used to simulate different regions.
 * Wind data is just calculated wind speed values from the model.
 */
export default class Wind {
    /**
     * The maximum wind speed of the year.
     */
    public max: number;

    /**
     * The standard deviation.
     */
    public stdev: number;

    
    /**
     * Creates a new wind model with the given parameters.
     * @param {number} max the maximum wind speed of the year
     * @param {number} stdev the standard deviation
     */
    constructor(max: number, stdev: number) {
        this.max = max;
        this.stdev = stdev;
        
        this.calcNextYear();
        this.calcNextDay();
    }

    
    update() {
        let sim = Simulation.getInstance();
        console.log('update at: ' + sim.time);
    }
    
    
    getSpeed() {
    }
    

    calcNextYear() {
        
    }


    calcNextDay() {
        
    }


    calc() {
        
    }
}
