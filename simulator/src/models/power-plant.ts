
/***************************************************************************
 * The power-plant model holds the neccessary parameters and power-plant data.
 ***************************************************************************/


import Simulation from "../simulation";
import Battery from "./battery";
import uuid from "uuid";
import { ElectricityGridDB, eq } from "./database";
import { randomFloat }  from "./utils";


/**
 * The power-plant model holds the parametes and model used to generate electricity.
 * Different power-plant models can be used to simulate different power-plants.
 */
export default class PowerPlant {
    /**
     * The uuid of the power plant.
     */
    private _id: string;

    /**
     * The status of the power plant.
     */
    private status: State;

    /**
     * The time it takes for the power plant to start.
     */
    private startDelay: number;

    /**
     * The time it takes for the power plant to stop.
     */
    private stopDelay: number;

    /**
     * The total production sent to the market.
     */
    private deltaProduction: number;

    /**
     * The number of kwh that should be produced by the power-plant. 
     */
    private _productionLevel: number;
    
    /**
     * The number of kwh that the power plant max can produce.
     */
    private productionCapacity: number;

    /**
     * The number of kwh that can differ from the productionLevel.
     */
    private productionVariant: number;

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
    private _owner: string;

    /**
     * The unit.
     */
    private unit: string;
    
    /**
     * The timestamp when this power plant object was created.
     */
    private createdAt: Date;

    /**
     * The timestamp when the power plant simulation was last updated.
     */
    private updatedAt: Date;

    
    /**
     * Creates a new power plant instance with the given parameters.
     * @param {string} id the power plants id.
     * @param {string} owner the power plant owner.
     * @param {number} productionLevel the number of kwh produced by the power plant.
     * @param {number} productionCapacity the max number of kwh that the power plant can produce.
     * @param {number} productionVariant the number of kwh that can differ from the productionLevel.
     * @param {number} productionRatio the percent of the production that is sent to the market.
     * @param {number} capacity the batteries capacity.
     * @param {Date} createdAt the time at PowerPlant object creation
     * @param {Date} updatedAt the time at PowerPlant object update
     */
    constructor(
        id: string,
        owner: string,
        productionLevel: number,
        productionCapacity: number,
        productionVariant: number,
        productionRatio: number,
        battery: Battery,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        let simTime = Simulation.getInstance()?.time;
        this._id = id;
        this._owner = owner;
        this.startDelay = 0;
        this.stopDelay = 0;
        this.status = State.Stopped;
        this.deltaProduction = 0;
        this._productionLevel = productionLevel;
        this.productionCapacity = productionCapacity;
        this.productionVariant = productionVariant;
        this._productionRatio = productionRatio;
        this._battery = battery;
        this.unit = "kwh";

        this.createdAt = createdAt || new Date(simTime);
        this.updatedAt = updatedAt || new Date(simTime);
    }


    /**
     * Generate prameters for the power plant simulation.
     * @returns {PowerPlant} a new power plant object
     */
    static generate(owner: string): PowerPlant {
        let id = uuid.v4();
        let productionLevel = randomFloat(100, 200);
        let productionCapacity = randomFloat(200, 400);
        let productionVariant = randomFloat(2, 10);
        let productionRatio = 0.1;
        let batteryCapacity = randomFloat(2000, 5000);
        let battery = new Battery(owner, batteryCapacity, 0)
        let powerPlant = new PowerPlant(id,
                                        owner,
                                        productionLevel,
                                        productionCapacity,
                                        productionVariant,
                                        productionRatio,
                                        battery);
        powerPlant.storePowerPlant();
        return powerPlant;
    }


    /**
     * Tries to find a power plant object in the database with the given id.
     * @returns {Promise<PowerPlant>} the power plant object is found
     */
    static async findById(id: string): Promise<PowerPlant> {
        let rows = await ElectricityGridDB.table('Power_plant').select([], [eq('id', id)]);
        if (rows.length == 1) {
            let row = rows[0];
            let battery = new Battery(row.owner, row.battery_capacity, row.battery_value);
            let plant = new PowerPlant(row.id,
                                       row.owner,
                                       row.production_level,
                                       row.production_capacity,
                                       row.production_variant,
                                       row.production_ratio,
                                       battery,
                                       row.created_at,
                                       row.updated_at);
            return plant
        } else {
            return Promise.reject("Could not find any power plant object with id " + id);
        }
    }

    /**
     * Store a given power plant in the power_plant table.
     * If there already exists data for this power plant
     * then update it instead.
     */
    storePowerPlant() {
        ElectricityGridDB.table('power_plant').insert_or_update({
            id: this._id,
            owner: this._owner,

            start_delay: this.startDelay,
            stop_delay: this.stopDelay,

            production_level: this._productionLevel,
            production_capacity: this.productionCapacity,
            production_variant: this.productionVariant,
            production_ratio: this._productionRatio,
            
            battery_capacity: this._battery.capacity,

            created_at: this.createdAt,
            updated_at: this.updatedAt,
        }, ['id']);
    }


    /**
     * Starts the power plant.
     * @note Takes some time before its starts.
     * @note The power plant can only start if its State is equal Stopped.
     */
    start() {
        if (this.status == State.Stopped) {
            this.status = State.Starting;
            this.startDelay = randomFloat(10000, 30000);
        }
    }


    /**
     * Stops the power plant.
     * @note Takes some time before its stops.
     * @note The power plant can only stop if its State is equal to Running.
     */
    stop() {
        if (this.status == State.Running) {
            this.status = State.Stopping;
            this.stopDelay = randomFloat(10000, 30000);
        }
    }


    /**
     * Update the power plant data in the database.
     * @param {Simulation} sim the simulation instance.
     */
    store(sim: Simulation) {
        let time = sim.time;

        (async () => {
            await storePowerPlantData({id: this._id,
                time: time,
                production: this.deltaProduction,
                battery_value: this._battery.value,
                unit: this.unit});
        })();
        
        this.deltaProduction = 0;
        this.updatedAt = sim.time;
    }


    /**
     * Updates the deltaProduction and battery value.
     * This method should be called each simulation step to ensure that
     * the power plant state is up to date.
     * @param {Simulation} sim the simulation instance.
     * @param {number} demand the number of kwh consumed and not covered by wind power since last step.
     */
    update(sim: Simulation, demand: number) {
        if (this.status == State.Running) {
            let production = this.simProduction(sim.time);
            let sentToMarket = production * this.productionRatio;
            this.deltaProduction += sentToMarket;
            this._battery.value += production - sentToMarket;
        } else {
            this._battery.value -= demand;

            if (this.status == State.Starting) {
                this.startDelay -= sim.deltaTime;
                if (this.startDelay <= 0){
                    this.startDelay = 0;
                    this.status = State.Running;
                }
            } else if (this.status == State.Stopping) {
                this.stopDelay -= sim.deltaTime;
                if (this.stopDelay <= 0){
                    this.stopDelay = 0;
                    this.status = State.Stopped;
                }
            }
        }
    }


    /**
     * Gets all the current power plant information.
     * @returns {PowerPlantStatus} the current power plant information. 
     */
    getStatus(sim: Simulation): PowerPlantStatus {
        let totalProduction = 0;
        if (this.status == State.Running) {
            totalProduction = this.simProduction(sim.time);
        }
        return {id: this._id,
                time: sim.time,
                status: this.status,

                productionLevel: this._productionLevel,
                productionCapacity: this.productionCapacity,
                productionVariant: this.productionVariant,
                productionRatio: this._productionRatio,

                batteryValue: this._battery.value,
                batteryCapacity: this._battery.capacity,

                totalProduction: totalProduction,
                unit: this.unit,
            };
    }


    /**
     * Gets all of the power plants historical data.
     * @returns {Promise<PowerPlantData[]} the power plants historical data.
     */
    async getHistoricalPowerPlantData(): Promise<PowerPlantData[]> {
        try {
            let rows = await ElectricityGridDB.table('power_plant_data').select([], [eq('id', this._id)]);
            if (rows.length == 0) {
                return Promise.reject("No data found in db for power plant with id: " + this._id);
            } else {
                return rows;
            }
        } catch(err) {
            console.trace(err);
            return err;
        }
    }
    

    /**
     * Gets the id of the power plant.
     * @returns {string} the power plants id.
     */
    get id(): string {
        return this._id;
    }


    /**
     * Gets the owner of the power plant.
     * @returns {string} the owner of the power plant.
     */
    get owner(): string {
        return this._owner;
    }
    

    /**
     * Set the productionLevel variable.
     * NOTE: Can't be lower then zero or higher the productionCapacity variable.
     * @param {number} newProductionLevel the new value of the class variable productionLevel.
     */
    set productionLevel(newProductionLevel: number) {
        if (newProductionLevel >= 0 && newProductionLevel <= this.productionCapacity) {
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
     * Simulates the amount of electricity produced.
     * @param {Date} time the current time
     * @returns {number} the simulated electricity production value.
     */
    private simProduction(time: Date): number {
        return this._productionLevel + Math.sin(time.getTime()) * this.productionVariant;
    }
}


/**
 * The different states that the power plant can be in.
 */
enum State {
    Stopped,
    Running,
    Starting,
    Stopping,
}


/**
 * PowerPlantStatus is a data structure for holding power plant information.
 */
export interface PowerPlantStatus {
    readonly id: string;
    readonly time: Date;
    readonly status: State;
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
 * PowerPlantData is a data structure for holding power plant data.
 */
export interface PowerPlantData {
    readonly id: string;
    readonly time: Date;
    readonly production: number;
    readonly battery_value: number;
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
