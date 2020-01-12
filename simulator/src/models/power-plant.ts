
/***************************************************************************
 * The power-plant model holds the neccessary parameters and power-plant data.
 ***************************************************************************/


import Simulation from "../simulation";
import Battery from "./battery";
import uuid from "uuid";
import { ElectricityGridDB, eq } from "../database";
import { randomFloat, randomInt }  from "./utils";


/**
 * The power-plant model holds the parametes and model used to generate electricity.
 * Different power-plant models can be used to simulate different power-plants.
 */
export default class PowerPlant {
    /**
     * The uuid of the power plant owner.
     */
    private _owner: string;
    
    /**
     * The status of the power plant.
     */
    private state: State;

    /**
     * The time it takes for the power plant to change its current state.
     */
    private delay: number;

    /**
     * The total production sent to the market.
     */
    private marketProduction: number;

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
    public battery: Battery;

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
     * @param {PowerPlantData} data the power plant parameters
     */
    constructor(data: PowerPlantData) {
        let sim = Simulation.getInstance();
        this._owner = data.owner;
        this.delay = data.delay || 0;
        this.state = data.state || State.Stopped;
        this.marketProduction = data.production_market || 0;
        this._productionLevel = data.production_level;
        this.productionCapacity = data.production_capacity;
        this.productionVariant = data.production_variant;
        this._productionRatio = data.production_ratio;
        this.unit = data.unit || "kwh";
        this.createdAt = data.created_at || sim.time;
        this.updatedAt = data.updated_at || sim.time;
        this.battery = new Battery(data.owner,
                                   data.battery_capacity,
                                   data.battery_value || 0);
    }


    /**
     * Generate prameters for the power plant simulation.
     * @returns {PowerPlant} a new power plant object
     */
    static generate(owner: string): PowerPlant {
        return new PowerPlant({
            owner: owner,
            production_level: randomFloat(100, 200),
            production_capacity: randomFloat(200, 400),
            production_variant: randomFloat(2, 10),
            battery_capacity: randomFloat(2000, 5000),
            production_ratio: 0.1,
        });
    }


    /**
     * Tries to find a power plant object in the database with the given owner id.
     * @returns {Promise<PowerPlant>} the power plant object is found
     */
    static async findByOwner(owner: string): Promise<PowerPlant> {
        let rows = await ElectricityGridDB.table('Power_plant')
            .select<PowerPlantData>([], [eq('owner', owner)]);
        if (rows.length == 1) {
            return new PowerPlant(rows[0]);
        } else {
            return Promise.reject("Could not find any power plant object with id " + owner);
        }
    }


    /**
     * Starts the power plant.
     * @note Takes some time before its starts.
     * @note The power plant can only start if its State is equal Stopped.
     */
    start() {
        if (this.state == State.Stopped) {
            this.state = State.Starting;
            this.delay = randomInt(10000, 30000);
        }
    }


    /**
     * Stops the power plant.
     * @note Takes some time before its stops.
     * @note The power plant can only stop if its State is equal to Running.
     */
    stop() {
        if (this.state == State.Running) {
            this.state = State.Stopping;
            this.delay = randomInt(10000, 30000);
        }
    }


    /**
     * Update the power plant data in the database.
     * @param {Simulation} sim the simulation instance.
     */
    store(sim: Simulation) {
        let time = sim.time;

        (async () => {
            await storePowerPlantData({
                owner: this.owner,
                time: time,
                production: this.marketProduction,
                battery_value: this.battery.value,
                unit: this.unit});
        })();
        
        this.marketProduction = 0;
        this.updatedAt = sim.time;
        
        ElectricityGridDB.table('power_plant').insert_or_update(this.data, ['owner']);
    }


    /**
     * Updates the marketProduction and battery value.
     * This method should be called each simulation step to ensure that
     * the power plant state is up to date.
     * @param {Simulation} sim the simulation instance.
     * @param {number} demand the number of kwh consumed and not covered by wind power since last step.
     */
    update(sim: Simulation) {
        if (this.state == State.Running) {
            let production = this.simProduction(sim.time);
            let sentToMarket = production * this.productionRatio;
            this.marketProduction += sentToMarket;
            this.battery.value += production - sentToMarket;
        } else if (this.state == State.Starting ||
                   this.state == State.Stopping){
            this.delay -= sim.deltaTime;
            if (this.delay <= 0){
                this.delay = 0;
                if (this.state == State.Starting) {
                    this.state = State.Running;
                } else {
                    this.state = State.Stopped;
                }
            }
        }
        //this.battery.value -= demand; do this elsewhere
    }


    /**
     * Gets all of the power plants historical data.
     * @returns {Promise<PowerPlantData[]} the power plants historical data.
     */
    async getHistoricalPowerPlantData(): Promise<PowerPlantData[]> {
        try {
            let rows = await ElectricityGridDB.table('power_plant_data').select([], [eq('owner', this.owner)]);
            if (rows.length == 0) {
                return Promise.reject("No data found in db for power plant with id: " + this.owner);
            } else {
                return rows;
            }
        } catch(err) {
            console.trace(err);
            return err;
        }
    }

    
    /**
     * Gets all the current power plant information.
     * @returns {PowerPlantStatus} the current power plant information. 
     */
    get data(): PowerPlantData {
        return {
            owner: this.owner,
            state: this.state,
            production_level: this.productionLevel,
            production_capacity: this.productionCapacity,
            production_variant: this.productionVariant,
            production_ratio: this.productionRatio,
            battery_value: this.battery.value,
            battery_capacity: this.battery.capacity,
            unit: this.unit,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
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
    Stopped = "Stopped",
    Running = "Running",
    Starting = "Starting",
    Stopping = "Stopping",
}


/**
 * PowerPlantData holds the powerplants parameters.
 */
export interface PowerPlantData {
    readonly owner: string;
    readonly state?: State;
    readonly delay?: number;
    readonly production_level: number;
    readonly production_capacity: number;
    readonly production_variant: number;
    readonly production_ratio: number;
    readonly production_market?: number;
    readonly battery_value?: number;
    readonly battery_capacity: number;
    readonly unit?: string;
    readonly created_at?: Date;
    readonly updated_at?: Date;
}


/**
 * PowerPlantStatus is a data structure for holding power plant status.
 */
export interface PowerPlantStatus {
    readonly owner: string;
    readonly time: Date;
    readonly production: number;
    readonly battery_value: number;
    readonly unit: string;
}


/**
 * Store a given power plant data in the power_plant_data table.
 * If there already exists data for this time then update instead.
 */
async function storePowerPlantData(data: PowerPlantStatus) {
    try {
        await ElectricityGridDB.table('power_plant_data').insert_or_update(data, ['time']);
    } catch (err) {
        console.log("[Power Plant] Failed to store power plant data");
    }
}
