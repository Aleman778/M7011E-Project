
/***************************************************************************
 * The house model is used to keep track of eletricity consumption
 * and eventually the production of their wind tubine.
 ***************************************************************************/

import uuid from "uuid";
import Battery from "./battery";
import WindTurbine from "./wind-turbine";
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
     * The ratio of the excess power to store in the battery.
     */
    private _storeBatteryRatio: number;

    /**
     * The ratio of the under production power to consume from the battery.
     */
    private _consumeBatteryRatio: number;
    
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
    private battery?: Battery;

    /**
     * The wind turbine connected to this house.
     */
    private windTurbine?: WindTurbine;

    
    /**
     * Creats a new house model
     */
    constructor(
        id: string,
        owner: string,
        consumptionMax: number,
        consumptionStdev: number,
        battery: Battery,
        windTurbine?: WindTurbine,
    ) {
        this._id = id;
        this._owner = owner;
        this._storeBatteryRatio = 0.5;
        this._consumeBatteryRatio = 0.5;
        this.battery = battery;
        this.windTurbine = windTurbine;
        this.consumptionMax = consumptionMax;
        this.consumptionStdev = consumptionStdev;
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
        let turbine = WindTurbine.generate();
        let battery = new Battery(owner, batteryCapacity);
        return new House(id, owner, max, stdev, battery, turbine);
    }


    /**
     * Tries to find a house registered with the provided uuid.
     * @param {string} id the uuid of the house owner
     * @returns {House} the found house model
     */
    static findById(id: string): House {
        try {
            let house = await ElectricityGridDB.table('house')
                .select([], [eq('id', id)])[0];
            let turbine = await WindTurbine.findById(house.wind_turbine);
            if (house.length == 1) {
                return new House(house.id, house.owner, house.st)
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
        await this.turbine?.update();
        let production = this.turbine.currentPower();
        let consumption = this.calculateConsumption(sim.time);
        if (production > consumption) {
            let excess = production - consumption;
            
            sellPower(excess);
        } else if (consumption > production) {
            let demand = consumeBattery(consumption - production);
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
            wind_turbine: this.wind_turbine.id,
            battery_value: this.battery.value,
            battery_capacity: this.battery.capacity,
            consumption_max: this.consumptionMax,
            consumption_stdev: this.consumptionStdev,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        }, ['id']);
    }


    /**
     * Store any excess power in the battery. Only a ratio that is
     * set by the user is stored in the battery. 
     */
    private storeExcessPower(excess: number): number {
    }


    /**
     * Sell excess power to market in the nearest power plant.
     * The user may select the ratio of excess power to store
     * and the rest is sold to market.
     */
    private sellExcessPower(excess: number) {
        
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
        return owner;
    }

    /**
     * Getter for teh uuid of this house.
     * @return {string} the house uuid
     */
    get id() {
        return id;
    }
}
