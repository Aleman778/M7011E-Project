
/***************************************************************************
 * The power-plant model holds the neccessary parameters and power-plant data.
 ***************************************************************************/


import Simulation from "../simulation";
import { ClimateDB, eq } from "./database";
import * as utils from "./utils";


/**
 * The power-plant model holds the parametes and model used to generate electricity.
 * Different power-plant models can be used to simulate different power-plants.
 */
export default class Wind {
   
    /**
     * The number of kw that should be produced by the power-plant. 
     */
    private productionLevel: number;
    
    /**
     * The number of kw that the power plant max can produce.
     */
    private maxProduction: number;

    /**
     * The number of kw that can differ from the productionLevel.
     */
    private productionVariant: number;

    /**
     * The percent of produced electricity that is sent to the market.
     */
    private productionRatio: number;

    /**
     * Keep track of the time when the last wind speed was generated.
     */
    private time: Date;
    
    /**
     * The timestamp when this wind object was created.
     */
    public createdAt: Date;

    /**
     * The timestamp when the wind simulation was last updated.
     */
    private updatedAt: Date;

    
    /**
     * Creates a new power plant instance with the given parameters.
     * @param {number} productionLevel the number of kw produced by the power plant.
     * @param {number} maxProduction the max number of kw that the power plant can produce.
     * @param {number} productionVariant the number of kw that can differ from the productionLevel.
     * @param {number} productionRatio the percent of the production that is sent to the market.
     * @param {Date} time the time at last generated wind speed
     * @param {Date} createdAt the time at wind object creation
     * @param {Date} updatedAt the time at wind object update
     */
    constructor(
        productionLevel: number,
        maxProduction: number,
        productionVariant: number,
        productionRatio: number,
        time?: Date,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        let simTime = Simulation.getInstance()?.time;
        this.productionLevel = productionLevel;
        this.maxProduction = maxProduction;
        this.productionVariant = productionVariant;
        this.productionRatio = productionRatio;
        this.time = time || new Date(simTime.getFullYear(),
                                     simTime.getMonth(),
                                     simTime.getDate() - 2);
        this.createdAt = createdAt || new Date(simTime);
        this.updatedAt = updatedAt || new Date(simTime);
    }


    /**
     * Gets the amount of electricity produced and sent to the market.
     * @param {Date} time the current time
     */
    getProduction(time: Date): ElectricityProduced {
        let newValue = this.simProduction(time) * this.productionRatio;
        let unit = "kw";
        return {time: time, value: newValue, unit: unit};
    }

    /**
     * Gets the amount of electricity produced and sent to the market.
     * @param {Date} time the current time
     */
    getTotalProduction(time: Date): ElectricityProduced {
        let newValue = this.simProduction(time);
        let unit = "kw";
        return {time: time, value: newValue, unit: unit};
    }

    /**
     * Simulates the amount of electricity produced.
     * @param {Date} time the current time
     */
    private simProduction(time: Date): number {
        return this.productionLevel + Math.sin(time.getTime()) * this.productionVariant;
    }
}


/***************************************************************************
 * Production data useful for keeping history of wind speeds.
 ***************************************************************************/


/**
 * ElectricityProduced is a data structure for holding electricity production data.
 */
export interface ElectricityProduced {
    readonly time: Date;
    readonly value: number;
    readonly unit: string;
}
