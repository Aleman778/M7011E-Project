
/***************************************************************************
 * The house model is used to keep track of eletricity consumption
 * and eventually the production of their wind tubine.
 ***************************************************************************/

import uuid from "uuid";
import Simulation from "../simulation";
import Battery from "./battery";
import WindTurbine from "./wind-turbine";
import PowerPlant from "./power-plant";
import { ElectricityGridDB, eq } from "./database";
import { gaussian, randomFloat, HOUR_MILLISEC } from "./utils";


/**
 * The house model defines the 
 */
export default class House {
    /**
     * The house uuid.
     */
    private _id: string;
    
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
     * The battery connected to this house.
     */
    public battery?: Battery;

    /**
     * The wind turbine connected to this house.
     */
    public windTurbine?: WindTurbine;

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
     * @param {string} id the house uuid
     * @param {string} owner the house owners uuid
     * @param {number} consumptionMax the max power consumption
     * @param {number} consumptionStdev the standard deviation power consumption
     * @param {Battery} battery optionally attach a battery to this house
     * @param {WindTurbine} windTurbine optionally attach a wind turbine to this house
     */
    constructor(
        id: string,
        owner: string,
        consumptionMax: number,
        consumptionStdev: number,
        createdAt?: Date,
        updatedAt?: Date,
        battery?: Battery,
        windTurbine?: WindTurbine,
        powerPlant?: PowerPlant
    ) {
        let sim = Simulation.getInstance();
        this._id = id;
        this._owner = owner;
        this._chargeRatio = 0.5;
        this._consumeRatio = 0.5;
        this.battery = battery;
        this.windTurbine = windTurbine;
        this.consumptionMax = consumptionMax;
        this.consumptionStdev = consumptionStdev;
        this.createdAt = createdAt || sim.time;
        this.updatedAt = updatedAt || sim.time;
    }

    
    /**
     * Generates a new house model for the given owner.
     * @param {string} owner the user who owns this house
     * @returns {House} the generated house model
     */
    static generate(owner: string): House {
        let id = uuid.v4();
        let max = randomFloat(2.0, 4.0);
        let stdev = randomFloat(0.2, 1.0);
        let batteryCapacity = randomFloat(80, 100);
        let turbine = WindTurbine.generate(owner);
        let battery = new Battery(owner, batteryCapacity);
        return new House(id,
                         owner,
                         max,
                         stdev,
                         undefined,
                         undefined,
                         battery,
                         turbine,
                         undefined);
    }


    /**
     * Tries to find a house registered with the provided uuid.
     * @param {string} id the uuid of the house owner
     * @returns {House} the found house model
     */
    static async findById(id: string): Promise<House> {
        try {
            let houses = await ElectricityGridDB.table('house')
                .select([], [eq('id', id)]);
            if (houses.length) {
                let house = houses[0];
                let turbine = await WindTurbine.findById(house.wind_turbine);
                let battery = new Battery(house.owner,
                                          house.battery_capacity,
                                          house.battery_value);
                let powerPlant: PowerPlant | undefined = undefined;
                if (house.powerPlant) {
                    powerPlant = await Simulation.getInstance()?.state?.powerPlant(house.powerPlant);
                }
                return new House(house.id,
                                 house.owner,
                                 house.consumption_max,
                                 house.consumption_stdev,
                                 house.created_at,
                                 house.updated_at,
                                 battery,
                                 turbine,
                                 powerPlant);
            } else {
                return Promise.reject("Failed to find the house model with id " + id);
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
        let production = 0;
        if (this.windTurbine != undefined) {
            await this.windTurbine?.update(sim);
            let production = this.windTurbine?.currentPower;
        }
        let consumption = this.calculateConsumption(sim.time);
        if (production > consumption) {
            let excess = production - consumption;
            if (this.battery != undefined) {
                excess = this.battery.charge(excess, this._chargeRatio);
            }
            if (this.powerPlant != undefined) {
                // Not sure how to connect this up yet.
            }
        } else if (consumption > production) {
            let demand = consumption - production;
            if (this.battery != null) {
                demand = this.battery.consume(demand, this._consumeRatio);
            }
            if (this.powerPlant != undefined) {
                // Not sure how to connect this up yet.
            }
        }
        
        console.log({prod: production, cons: consumption});
        
    }    
    

    /**
     * Store the house model information to the database.
     */
    store() {
        ElectricityGridDB.table('house').insert_or_update({
            id: this.id,
            owner: this.owner,
            wind_turbine: this.windTurbine?.id,
            battery_value: this.battery?.value,
            battery_capacity: this.battery?.capacity,
            consumption_max: this.consumptionMax,
            consumption_stdev: this.consumptionStdev,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        }, ['id']);
    }

    
    /**
     * Calculate the electricity consumption for this house.
     * @param {Date} time current sim time
     * @returns {number} the electricity consumption
     */
    private calculateConsumption(time: Date) {
        let step = (this.consumptionStdev * 3.0) / 24.0;
        let hour = time.getTime() / HOUR_MILLISEC;
        return gaussian(step * (hour - 12), this.consumptionMax ,
                        0, this.consumptionStdev);
    }
    
    
    /**
     * Getter for the uuid of the house owner.
     * @returns {string} the owner uuid
     */
    get owner() {
        return this._owner;
    }

    /**
     * Getter for teh uuid of this house.
     * @return {string} the house uuid
     */
    get id() {
        return this._id;
    }
}
