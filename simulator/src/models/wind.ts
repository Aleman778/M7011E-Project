
/***************************************************************************
 * The wind model holds the neccessary parameters and wind data.
 ***************************************************************************/


import Simulation from "../simulation";
import { ClimateDB, eq } from "./database";
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
     * The wind speed unit.
     */
    public unit: string;

    /**
     * The timestamp where this wind object was created.
     */
    public createdAt: Date;

    
    /**
     * Creates a new wind model with the given parameters.
     * @param {number} max the maximum wind speed of the year
     * @param {number} stdev the standard deviation
     */
    constructor(max: number, stdev: number) {
        this.max = max;
        this.stdev = stdev;
        this.unit = "m/s";
        this.createdAt = Simulation.getInstance()?.time;
        this.store();
        
        this.calcNextYear();
        this.calcNextDay();
    }

    
    /**
     * Update the values in the wind simulator.
     */
    update() {
        
    }

    
    store() {
        var sim = Simulation.getInstance();
        ClimateDB.table('wind').insert_or_update({
            id: 0,
            max: this.max,
            stdev: this.stdev,
            unit: this.unit,
            created_at: this.createdAt,
            updated_at: sim.time,
        }, ['id']).then(() => {
            (async () => {
                let rows = await ClimateDB.table('wind').select([eq('id', 0)]);
                console.log(rows);
                ClimateDB.table('wind').remove([eq('id', 0)]);
            })();
        });
    }
    
    
    getSpeed(): WindSpeed {
        let sim = Simulation.getInstance();
        return {time: sim.time, value: 10, unit: this.unit};
    }
    

    calcNextYear() {
        
    }


    calcNextDay() {
        
    }


    calc() {
        
    }
}


/**
 * The wind data class is simly a datastructure
 * for holding wind data and storing it in database.
 */
export interface WindSpeed {
    readonly time: Date;
    readonly value: number;
    readonly unit: string;
}
