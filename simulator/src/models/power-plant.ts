
/***************************************************************************
 * The power-plant model holds the neccessary parameters and power-plant data.
 ***************************************************************************/


import Simulation from "../simulation";
import Battery from "./battery";
import uuid from "uuid";
import { ElectricityGridDB, eq } from "./database";
import * as utils from "./utils";


/**
 * Tells the state of object.
 */
enum Status {
    Stopped,
    Running,
    Starting,
    Stopping,
}


/**
 * PowerPlantInfo is a data structure for holding power plant information.
 */
export interface PowerPlantInfo {
    readonly id: uuid.v4;
    readonly time: Date;
    readonly status: Status;

    readonly productionLevel: number;
    readonly productionCapacity: number;
    readonly productionVariant: number;
    readonly productionRatio: number;

    readonly batteryValue: number;
    readonly batteryCapacity:number;

    readonly totalProduction: number;

    readonly unit: string;
}


/**
 * The power-plant model holds the parametes and model used to generate electricity.
 * Different power-plant models can be used to simulate different power-plants.
 */
export default class PowerPlant {
    /**
     * The uuid of the power plant.
     */
    private _id: uuid.v4;

    /**
     * The status of the power plant.
     */
    private _status: Status;

    /**
     * The time it takes for the pwoer plant to start.
     */
    private _startDelay: number;

    /**
     * The time it takes for the pwoer plant to stop.
     */
    private _stopDelay: number;

    /**
     * The number of kw that should be produced by the power-plant. 
     */
    private _productionLevel: number;
    
    /**
     * The number of kw that the power plant max can produce.
     */
    private _productionCapacity: number;

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
     * @param {uuid.v4} id the power plants id.
     * @param {uuid.v4} owner the power plant owner.
     * @param {number} startDelay the time it takes for the power plant to start.
     * @param {number} stopDelay the time it takes for the power plant to stop.
     * @param {number} productionLevel the number of kw produced by the power plant.
     * @param {number} productionCapacity the max number of kw that the power plant can produce.
     * @param {number} productionVariant the number of kw that can differ from the productionLevel.
     * @param {number} productionRatio the percent of the production that is sent to the market.
     * @param {number} capacity the batteries capacity.
     * @param {Date} time the time at last generated wind speed
     * @param {Date} createdAt the time at wind object creation
     * @param {Date} updatedAt the time at wind object update
     */
    constructor(
        id: uuid.v4,
        owner: uuid.v4,
        startDelay: number,
        stopDelay: number,
        productionLevel: number,
        productionCapacity: number,
        productionVariant: number,
        productionRatio: number,
        capacity: number,
        time?: Date,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        let simTime = Simulation.getInstance()?.time;
        this._id = id;
        this._owner = owner;
        this._startDelay = startDelay;
        this._stopDelay = stopDelay;
        this._status = Status.Stopped;
        this._productionLevel = productionLevel;
        this._productionCapacity = productionCapacity;
        this._productionVariant = productionVariant;
        this._productionRatio = productionRatio;
        this._battery = new Battery(owner, capacity, capacity/2);

        this._time = time || new Date(simTime.getFullYear(),
                                     simTime.getMonth(),
                                     simTime.getDate() - 2);
        this._createdAt = createdAt || new Date(simTime);
        this._updatedAt = updatedAt || new Date(simTime);
    }


    /**
     * Tries to find a power plant object in the database with the given id.
     * @returns {Promise<PowerPlant>} the wind object is found
     */
    static async findById(id: number): Promise<PowerPlant> {
        let rows = await ElectricityGridDB.table('Power_plant').select([], [eq('id', id)]);
        if (rows.length == 1) {
            let row = rows[0];
            let plant = new PowerPlant(row.id,
                            row.owner,
                            row.start_delay,
                            row.stop_delay,
                            row.production_level,
                            row.production_capacity,
                            row.production_variant,
                            row.production_ratio,
                            row.battery_capacity,
                            row.time,
                            row.created_at,
                            row.updated_at);
            return plant
        } else {
            return Promise.reject("Could not find any wind object with id " + id);
        }
    }

    /**
     * Store a given power plant data in the power_plant_data table.
     * If there already exists data for this time then update instead.
     */
    store() {
        ElectricityGridDB.table('power_plant').insert_or_update({
            id: this._id,
            owner: this._owner,

            start_delay: this._startDelay,
            stop_delay: this._stopDelay,

            production_level: this._productionLevel,
            production_capacity: this._productionCapacity,
            production_variant: this._productionVariant,
            production_ratio: this._productionRatio,
        
            battery_capacity: this._battery.capacity,

            time: this._time,
            created_at: this._createdAt,
            updated_at: this._updatedAt,
        }, ['id']);
    }


    /**
     * Starts the power plant.
     * @note Takes some time before its starts.
     * @note The power plant can only start if its Status is equal Stopped.
     */
    start() {
        if (this._status == Status.Stopped) {
            this._status = Status.Starting;
            setTimeout(() => {
                this._status = Status.Running;
            }, this._startDelay);
        }
    }


    /**
     * Stops the power plant.
     * @note Takes some time before its stops.
     * @note The power plant can only stop if its Status is equal to Running.
     */
    stop() {
        if (this._status == Status.Running) {
            this._status = Status.Stopping;
            setTimeout(() => {
                this._status = Status.Stopped;
            }, this._stopDelay);
        }
    }


    /**
     * Update the power plant data in the database if there is new data present.
     * This method should be called each simulation step to ensure that
     * the database is populated with new data.
     * @param {Simulation} sim the simulation instance.
     */
    update(sim: Simulation) {
        let time = sim.timeHour;
        time.setHours(time.getHours() + 1);
        
        let diffTime = time.getTime() - this.time.getTime();
        if (diffTime > 0) {
            let diffDays = Math.round(diffTime / utils.DAY_MILLISEC);
            let lastTime = new Date(this.time);
            this._time = time;
            (async () => {
                if (diffDays == 0) {
                    console.log("[Power Plant] One or more hours has passed since last update.");
                } else if (diffDays >= 1 && diffDays <= 3) {
                    console.log("[Power Plant] One or more days has passed since last update.");
                } else if (diffDays > 3) {
                    lastTime = utils.incrTime(time, -3 * utils.DAY_MILLISEC);
                    diffDays = 3;
                    console.log("[Power Plant] More than three days has passed since last update.");
                    console.log("[Power Plant] Only the last three days are stored in the database");
                    console.log("[Power Plant] Updating from the date:", lastTime.toUTCString());
                }
                // await this.updateDay(time, lastTime);
                
            })();
        }
        this._updatedAt = sim.time;
    }


    /**
     * Gets the amount of electricity produced.
     * @param {Date} time the current time
     * @returns {number} the electricity produced. 
     */
    getProduction(time: Date): Number {
        return this.simProduction(time);
    }

    /**
     * Gets all the current power plant information.
     * @returns {PowerPlantInfo} the current power plant information. 
     */
    getPowerPlantInfo(): PowerPlantInfo {
        let totalProduction = 0;
        if (this.status == Status.Running) {
            totalProduction = this.simProduction(this._time);
        }
        let unit = "kw";
        return {id: this._id,
                time: this._time,
                status: this._status,

                productionLevel: this._productionLevel,
                productionCapacity: this._productionCapacity,
                productionVariant: this._productionVariant,
                productionRatio: this.productionRatio,

                batteryValue: this._battery.value,
                batteryCapacity: this._battery.capacity,

                totalProduction: totalProduction,
                unit: unit
            };
    }
    

    /**
     * Gets the id of the power plant.
     * @returns {uuid.v4} the power plants id.
     */
    get id(): uuid.v4 {
        return this._id;
    }


    /**
     * Gets the time it takes for the power plant to start in milliseconds.
     * @returns {uuid.v4} the time it takes for the power plant to start.
     */
    get startDelay(): number {
        return this._startDelay;
    }


    /**
     * Gets the time it takes for the power plant to stop in milliseconds.
     * @returns {uuid.v4} the time it takes for the power plant to stop.
     */
    get stopDelay(): number {
        return this._stopDelay;
    }


    /**
     * Gets the power plants status.
     * @returns {Status} the power plants status.
     */
    get status(): Status {
        return this._status;
    }


    /**
     * Gets the productionLevel variable value.
     * @returns {number} the current productionLevel value.
     */
    get productionLevel(): number {
        return this._productionLevel;
    }


    /**
     * Gets the productionCapacity variable value.
     * @returns {number} the current productionCapacity value.
     */
    get productionCapacity(): number {
        return this._productionCapacity;
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
     * NOTE: Can't be lower then zero or higher the productionCapacity variable.
     * @param {number} newProductionLevel the new value of the class variable productionLevel.
     */
    set productionLevel(newProductionLevel: number) {
        if (newProductionLevel >= 0 && newProductionLevel <= this._productionCapacity) {
            this._productionLevel = newProductionLevel;
        }        
    }


    /**
     * Set the productionRatio variable.
     * @note Can't be lower the zero or higher then one;
     * @param {number} newProductionRatio the new value of the class variable productionRatio.
     */
    set productionRatio(newProductionRatio: number) {
        if (newProductionRatio >= 0 && newProductionRatio <= 1) {
            this._productionRatio = newProductionRatio;
        }
    }


    /**
     * Sets a new value to the batteries value variable.
     * @note the new value must be between or equal to zero or capacity.
     * @param {number} newValue the batteries new value.
     */
    set batteryValue(newValue: number) {
        this._battery.value = newValue;
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
 * PowerPlantData is a data structure for holding power plant data.
 */
export interface PowerPlantData {
    readonly id: uuid.v4;
    readonly time: Date;

    readonly production: number;
    readonly batteryValue: number;
    readonly unit: string;
}


/**
 * Store a given power plant data in the power_plant_data table.
 * If there already exists data for this time then update instead.
 */
async function storePowerPlantData(data: PowerPlantData) {
    try {
        await ElectricityGridDB.table('power_plant_data').insert_or_update(data, ['time']);
    } catch (err) {
        console.log("[Power Plant] Failed to store power plant data");
    }
}
