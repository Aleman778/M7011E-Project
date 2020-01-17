
/***************************************************************************
 * The house model is used to keep track of eletricity consumption
 * and eventually the production of their wind tubine.
 ***************************************************************************/

import uuid from "uuid";
import Simulation from "../simulation";
import Battery from "./battery";
import WindTurbine from "./wind-turbine";
import PowerPlant from "./power-plant";
import { ElectricityGridDB, eq } from "../database";
import { gaussian, randomFloat, HOUR_MILLISEC } from "./utils";


/**
 * The house model defines the 
 */
export default class House {
    /**
     * The uuid of the house owner.
     */
    private _owner: string;

    /**
     * The ratio of excess power to charge the battery with.
     */
    private _chargeRatio: number;

    /**
     * The ratio of demanded power to consume from the battery.
     */
    private _consumeRatio: number;
    
    /**
     * The maximum power consumption for this house.
     */
    private consumptionMax: number;

    /**
     * The standard deviation for modelling the consumption.
     */
    private consumptionStdev: number;

    /**
     * The number of milliseconds blocked from selling to market.
     */
    public blockTimer: number;
    
    /**
     * A boolean for keeping track of blackout.
     */
    public blackOut: boolean;

    /**
     * The battery connected to this house.
     */
    public battery?: Battery;

    /**
     * The wind turbine connected to this house.
     */
    public turbine?: WindTurbine;

    /**
     * Connect the house to a powerplant
     */
    public powerPlant?: PowerPlant;

    /**
     * The time when this wind turbine was created.
     */
    private createdAt: Date;

    /**
     * The time when the wind turbine was last updated in the database.
     */
    private updatedAt: Date;

    
    /**
     * Creates a new house model with the given parameters.
     * @param {HouseData} data provide data about the house
     */
    constructor(data: HouseData) {
        let sim = Simulation.getInstance();
        this._owner = data.owner;
        this._chargeRatio = +(data.charge_ratio || 0.5);
        this._consumeRatio = +(data.consume_ratio || 0.5);
        this.blockTimer = +(data.block_timer || 0.0);
        this.blackOut = false;
        this.consumptionMax = +data.consumption_max;
        this.consumptionStdev = +data.consumption_stdev;
        this.createdAt = data.created_at || sim.time;
        this.updatedAt = data.updated_at || sim.time;
        if (data.battery_capacity > 0) {
            this.battery = new Battery(data.owner,
                                       +data.battery_capacity);
            if (data.battery_value != undefined) {
                this.battery.value = +data.battery_value;
            }
        }
    }

    
    /**
     * Generates a new house model for the given owner.
     * @param {string} owner the user who owns this house
     * @param {boolean} producer is this house producing electricity?
     * @returns {House} the generated house model
     */
    static generate(owner: string, producer: boolean = true): House {
        let house = new House({
            owner: owner,
            consumption_max: randomFloat(2.0, 4.0),
            consumption_stdev: randomFloat(0.2, 1.0),
            battery_capacity: producer ? randomFloat(80, 100) : 0,
        });
        if (producer) {
            house.turbine = WindTurbine.generate(owner);
        }
        return house;
    }


    /**
     * Tries to find a house registered with the provided uuid.
     * @param {string} id the uuid of the house owner
     * @returns {House} the found house model
     */
    static async findByOwner(owner: string): Promise<House> {
        let sim = Simulation.getInstance();
        try {
            let data = await ElectricityGridDB.table('house')
                .select<HouseData>([], [eq('owner', owner)]);
            if (data.length == 1) {
                let house = new House(data[0]);
                house.turbine = await WindTurbine.findByOwner(owner);
                if (data[0].power_plant != undefined) {
                    house.powerPlant = await sim?.state?.powerPlant(data[0].power_plant);
                }
                return house;
            } else {
                return Promise.reject("Failed to find the house model with id " + owner);
            }
        } catch(err) {
            console.trace(err);
            return Promise.reject("Failed to retreive house data from database");
        }
    }
    


    /**
     * Update the house electricity consumptions and production.
     * @param {Simulation} sim the current simulation
     */
    async update(sim: Simulation) {
        if (this.powerPlant == undefined) {
            this.powerPlant = sim.state?.nearestPowerPlant();
        }
        let production = 0;
        if (this.turbine != undefined) {
            await this.turbine?.update(sim);
            production = this.turbine.currentPower;
        }
        if (this.blockTimer > 0) {
            this.blockTimer -= sim.deltaTime;
        }
        let consumption = this.calculateConsumption(sim);
        if (production > consumption) {
            let excess = production - consumption;
            excess = this.battery?.charge(excess, this._chargeRatio) || excess;
            if (this.blockTimer <= 0) {
                this.powerPlant?.market.sell(excess);
            }
            this.blackOut = false;
            // console.log("excess: " + excess);
        } else if (consumption > production) {
            let demand = consumption - production;
            demand = this.battery?.consume(demand, this._consumeRatio) || demand;
            demand = this.powerPlant?.market.buy(demand) || demand;
            if (demand > 0) {
                this.blackOut = true;
            } else {
                this.blackOut = false;
            }
            // console.log("demand: " + demand);
        } else {
            this.blackOut = false;
        }
        // console.log({
            // owner: this.owner,
            // production: production,
            // consumption: consumption,
            // battery: this.battery
        // });
    }

    

    /**
     * Store the house model information to the database.
     * @param {Simualation} sim the simulation instance
     */
    async store(sim: Simulation) {
        this.updatedAt = sim.time;
        await ElectricityGridDB.table('house').insert_or_update(this.data, ['owner']);
        if (this.turbine != undefined) {
            await this.turbine.store(sim);
        }
        
        let production = this.turbine?.currentPower || 0;
        let consumption = this.calculateConsumption(sim);
        let productionData = {
            id: this._owner,
            time: sim.time,
            production: production,
            consumption: consumption,
            net_consumption: production - consumption,
            battery_capacity: this.battery?.capacity || 0,
            battery_value: this.battery?.value || 0,
        };
        await ElectricityGridDB.table('prosumer_data').insert_or_update(productionData, ['id', 'time']);
    }


    /**
     * Send out information about the house, battery and wind turbine.
     * @param {Simualation} sim the simulation instance
     */
    out(): HouseOut {
        let sim = Simulation.getInstance();
        return {
            owner: this.owner,
            blockTimer: this.blockTimer,
            blackOut: this.blackOut,
            chargeRatio: this._chargeRatio,
            consumeRatio: this._consumeRatio,
            consumption: this.calculateConsumption(sim),
            battery: this.outBattery(),
            turbine: this.outTurbine(),
            powerPlant: this.outPowerPlant(),
        }
    }


    /**
     * Send out information about this battery.
     */
    private outBattery(): BatteryOut | undefined {
        if (this.battery != undefined) {
            return {
                capacity: this.battery.capacity,
                value: this.battery.value,
            };
        } else {
            return undefined;
        }
    }


    /**
     * Send out information about this wind turbine.
     */
    private outTurbine(): WindTurbineOut | undefined {
        if (this.turbine != undefined) {
            return {
                value: this.turbine.currentPower,
                repairTime: this.turbine.repairTime,
                broken: this.turbine.broken,
            };
        } else {
            return undefined;
        }
    }


    /**
     * Send out information about this power plant.
     */
    private outPowerPlant(): PowerPlantOut | undefined {
        if (this.powerPlant != undefined) {
            return {
                owner: this.powerPlant.owner,
                price: this.powerPlant.market.price,
            };
        } else {
            return undefined;
        }
    }

    
    /**
     * Calculate the electricity consumption for this house.
     * @param {Simulation} sim current simulation instance
     * @returns {number} the electricity consumption
     */
    private calculateConsumption(sim: Simulation): number {
        let step = (this.consumptionStdev * 3.0) / 24.0;
        let hour = sim.time.getHours();
        let incr = sim.time.getTime() - sim.timeHour.getTime();
        hour += incr/ HOUR_MILLISEC;
        let consumption = gaussian(step * (hour - 12), this.consumptionMax, 0, this.consumptionStdev);
        return consumption * sim.deltaHour;
    }


    /**
     * Setter for the charge ratio.
     * @param {number} ratio number between 0.0 and 1.0
     */
    set chargeRatio(ratio: number) {
        if (ratio < 0 || ratio > 1) {
            throw new Error("The charge ratio can only be a number from 0 through 1.");
        } else {
            this._chargeRatio = ratio;
        }
    }


    /**
     * Setter for the consume ratio.
     * @param {number} ratio number between 0.0 and 1.0
     */
    set consumeRatio(ratio: number) {
        if (ratio < 0 || ratio > 1) {
            throw new Error("The consume ratio can only be a number from 0 through 1.");
        } else {
            this._consumeRatio = ratio;
        }
    }
    

    /**
     * Getter for the house data
     * @returns {HouseData} the house data object
     */
    get data(): HouseData {
        return {
            owner: this.owner,
            power_plant: this.powerPlant?.owner,
            block_timer: this.blockTimer,
            battery_value: this.battery?.value,
            battery_capacity: this.battery?.capacity || 0,
            consumption_max: this.consumptionMax,
            consumption_stdev: this.consumptionStdev,
            charge_ratio: this._chargeRatio,
            consume_ratio: this._consumeRatio,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        }
    }

    
    /**
     * Getter for the uuid of the house owner.
     * @returns {string} the owner uuid
     */
    get owner(): string {
        return this._owner;
    }
}


/**
 * Datastructure for holding house data from database.
 */
export interface HouseData {
    readonly owner: string;
    readonly power_plant?: string;
    readonly block_timer?: number;
    readonly battery_value?: number;
    readonly battery_capacity: number;
    readonly consumption_max: number;
    readonly consumption_stdev: number;
    readonly charge_ratio?: number;
    readonly consume_ratio?: number;
    readonly created_at?: Date;
    readonly updated_at?: Date;
}


/***************************************************************************
 * Data sent through the REST API
 ***************************************************************************/


/**
 * The output information from this house sent over REST API.
 */
export interface HouseOut {
    readonly owner: string;
    readonly blockTimer: number;
    readonly blackOut: boolean;
    readonly chargeRatio: number;
    readonly consumeRatio: number;
    readonly consumption: number;
    readonly battery?: BatteryOut;
    readonly turbine?: WindTurbineOut;
    readonly powerPlant?: PowerPlantOut;
}


/**
 * The output information from this battery to send.
 */
export interface BatteryOut {
    readonly capacity: number;
    readonly value: number;
}


/**
 * The output information from this wind turbine send.
 */
export interface WindTurbineOut {
    readonly value: number;
    readonly repairTime: number;
    readonly broken: boolean;
}


/**
 * The output information from connected power plant to send.
 */
export interface PowerPlantOut {
    readonly owner: string;
    readonly price: number;
}
