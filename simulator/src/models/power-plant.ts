
/***************************************************************************
 * The power-plant model holds the neccessary parameters and power-plant data.
 ***************************************************************************/


import Simulation from "../simulation";
import Battery from "./battery";
import uuid from "uuid";


/**
 * The power-plant model holds the parametes and model used to generate electricity.
 * Different power-plant models can be used to simulate different power-plants.
 */
export default class Wind {
   
    /**
     * The number of kw that should be produced by the power-plant. 
     */
    private _productionLevel: number;
    
    /**
     * The number of kw that the power plant max can produce.
     */
    private _maxProduction: number;

    /**
     * The number of kw that can differ from the productionLevel.
     */
    private _productionVariant: number;

    /**
     * The percent of produced electricity that is sent to the market.
     */
    private _productionRatio: number;

    /**
     * The power plants battery.
     */
    private _battery: Battery;

    /**
     * The uuid of the power plant owner.
     */
    private _owner: uuid.v4;

    /**
     * Keep track of the time when the last wind speed was generated.
     */
    private _time: Date;
    
    /**
     * The timestamp when this wind object was created.
     */
    public _createdAt: Date;

    /**
     * The timestamp when the wind simulation was last updated.
     */
    private _updatedAt: Date;

    
    /**
     * Creates a new power plant instance with the given parameters.
     * @param {number} productionLevel the number of kw produced by the power plant.
     * @param {number} maxProduction the max number of kw that the power plant can produce.
     * @param {number} productionVariant the number of kw that can differ from the productionLevel.
     * @param {number} productionRatio the percent of the production that is sent to the market.
     * @param {uuid.v4} owner the power plant owner.
     * @param {number} capacity the batteries capacity.
     * @param {Date} time the time at last generated wind speed
     * @param {Date} createdAt the time at wind object creation
     * @param {Date} updatedAt the time at wind object update
     */
    constructor(
        productionLevel: number,
        maxProduction: number,
        productionVariant: number,
        productionRatio: number,
        owner: uuid.v4,
        capacity: number,
        time?: Date,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        let simTime = Simulation.getInstance()?.time;
        this._productionLevel = productionLevel;
        this._maxProduction = maxProduction;
        this._productionVariant = productionVariant;
        this._productionRatio = productionRatio;
        this._owner = owner;
        this._battery = new Battery(owner, capacity, capacity/2);

        this._time = time || new Date(simTime.getFullYear(),
                                     simTime.getMonth(),
                                     simTime.getDate() - 2);
        this._createdAt = createdAt || new Date(simTime);
        this._updatedAt = updatedAt || new Date(simTime);
    }


    /**
     * Gets the amount of electricity produced and sent to the market.
     * @param {Date} time the current time
     * @returns {ElectricityProduced} the electricity production and sent to the market at the given time and its unit. 
     */
    getProduction(time: Date): ElectricityProduced {
        let newValue = this.simProduction(time) * this._productionRatio;
        let unit = "kw";
        return {time: time, value: newValue, unit: unit};
    }

    /**
     * Gets the amount of electricity produced and sent to the market.
     * @param {Date} time the current time.
     * @returns {ElectricityProduced} the total electricity production at the given time and its unit. 
     */
    getTotalProduction(time: Date): ElectricityProduced {
        let newValue = this.simProduction(time);
        let unit = "kw";
        return {time: time, value: newValue, unit: unit};
    }
    

    /**
     * Gets the productionLevel variable value.
     * @returns {number} the current productionLevel value.
     */
    get productionLevel(): number {
        return this._productionLevel;
    }


    /**
     * Gets the maxProduction variable value.
     * @returns {number} the current maxProduction value.
     */
    get maxProduction(): number {
        return this._maxProduction;
    }


    /**
     * Gets the productionVariant variable value.
     * @returns {number} the current productionVariant value.
     */
    get productionVariant(): number {
        return this._productionVariant;
    }


    /**
     * Gets the productionRatio variable value.
     * @returns {number} the current productionRatio value.
     */
    get productionRatio(): number {
        return this._productionRatio;
    }


    /**
     * Gets the owner of the power plant.
     * @returns {uuid.v4} the owner of the power plant.
     */
    get owner(): uuid.v4 {
        return this._owner;
    }


    /**
     * Gets the batteries owner;
     * @returns {uuid.v4} the owner of the battery.
     */
    get batteryOwner(): uuid.v4 {
        return this._battery.owner;
    }


    /**
     * Gets the batteries current value.
     * @returns {number} the batteries current value.
     */
    get batteryValue(): number {
        return this._battery.value;
    }


    /**
     * Gets the batteries capacity.
     * @returns {number}
     */
    get batteryCapacity(): number {
        return this._battery.capacity;
    }


    /**
     * Gets the time variable value.
     * @returns {Date} the current time value.
     */
    get time(): Date {
        return this._time;
    }

    
    /**
     * Gets the cratedAt variable value.
     * @returns {Date} the current createdAt value. 
     */
    get createdAt(): Date {
        return this._createdAt;
    }


    /**
     * Gets the updatedAt variable value.
     * @returns {Date} the current updatedAt value.
     */
    get updatedAt(): Date {return this._updatedAt;}


    /**
     * Set the productionLevel variable.
     * NOTE: Can't be lower then zero or higher the maxProduction variable.
     * @param {number} newProductionLevel the new value of the class variable productionLevel.
     */
    set productionLevel(newProductionLevel: number) {
        if (newProductionLevel >= 0 && newProductionLevel <= this._maxProduction) {
            this._productionLevel = newProductionLevel;
        }        
    }


    /**
     * Set the productionRatio variable.
     * NOTE: Can't be lower the zero or higher then one;
     * @param {number} newProductionRatio the new value of the class variable productionRatio.
     */
    set productionRatio(newProductionRatio: number) {
        if (newProductionRatio >= 0 && newProductionRatio <= 1) {
            this._productionRatio = newProductionRatio;
        }
    }


    /**
     * Simulates the amount of electricity produced.
     * @param {Date} time the current time
     * @returns {number} the simulated electricity production value.
     */
    private simProduction(time: Date): number {
        return this._productionLevel + Math.sin(time.getTime()) * this._productionVariant;
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
