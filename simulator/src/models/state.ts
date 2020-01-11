
/***************************************************************************
 * The simulation state holds all the models relevant for this simulation.
 ***************************************************************************/

import uuid from "uuid";
import Wind from "./wind";
import House from "./house";
import WindTurbine from "./wind-turbine";
import PowerPlant from "./power-plant";
import Simulation from "../simulation";
import { ElectricityGridDB, eq } from "../database";


/**
 * The simuation state holds all models active in
 * the running simulation. 
 */
export default class SimulationState {
    /**
     * The main wind model.
     */
    public wind: Wind;

    /**
     * All the houses models in this state.
     */
    public houses: Map<House>;
    
    /**
     * All the power plant models in this state.
     */
    public powerPlants: Map<PowerPlant>;
    
    
    /**
     * Creats a new simulation state.
     * @param {Wind} wind the wind main wind object
     * @param {Houses[]} houses the registered houses in this state
     * @param {PowerPlant[]} powerPlants the registered power plants in this state
     */
    constructor(
        wind: Wind,
        houses?: Map<House>,
        powerPlants?: Map<PowerPlant>
    ) {
        this.wind = wind;
        this.houses = houses || {};
        this.powerPlants = powerPlants || {};
    }


    /**
     * Generate a new simulation using random parameters.
     * These random variables are checked to be somewhat realistic.
     * @param {string} id the simulation state uuid
     * @returns {SimulationState} the generated state
     */
    static generate(): SimulationState {
        let wind = Wind.generate();
        let state = new SimulationState(wind);
        return state;
    }
    

    /**
     * Restore the simulation state from previous checkpoint
     * stored in the database.
     * @param {string} id the simulation state uuid
     * @returns {Promise<SimulationState>} the restored state
     */
    static async restore(): Promise<SimulationState> {
        try {
            let wind = await Wind.findById(0);
            let houses: Map<House> = {};
            let data = await ElectricityGridDB.table('house').select([]);
            for (let i = 0; i < data.length; i++) {
                houses[data[i].owner] = new House(data[i]);
            }
            
            let powerPlants: Map<PowerPlant> = {};
            data = await ElectricityGridDB.table('power_plant').select([]);
            for (let i = 0; i < data.length; i++) {
                powerPlants[data[i].owner] = new PowerPlant(data[i]);
            }
            return new SimulationState(wind, houses, powerPlants);
        } catch(err) {
            console.trace(err);
            console.log("[SimulationState] Failed to restore from previous checkpoint");
            console.log("[SimulationState] Generating new simulation state...");
            return SimulationState.generate();
        }
    }


    /**
     * Update the simulation state variables.
     * @param {Simulation} sim the simulation instance
     */
    update(sim: Simulation) {
        this.wind.update(sim);
        for (let id in this.powerPlants) {
            this.powerPlants[id].update(sim); /** @TODO Change 0 to demand. */ 
        }
        for (let id in this.houses) {
            this.houses[id].update(sim);
        }
    }


    /**
     * Store the simulation state variables onto database.
     * Also store the id references to these resources for recreation.
     * @param {Simulation} sim the simulation instance
     */
    async store(sim: Simulation) {
        try {
            await this.wind.store();
            for (let owner in this.houses) {
                await this.houses[owner].store();
            }
            for (let owner in this.powerPlants) {
                await this.powerPlants[owner].store(sim);
            }
        } catch(err) {
            console.trace(err);
            console.log("[SimulationState] Failed to store entire simulation at checkpoint");
        }
    }


    /**
     * Looks up a house based on the given owner.
     * If it is not found then tries to load from database.
     * @param {string} owner the house uuid
     * @returns {Promise<House>} the house if found
     */
    async house(owner: string): Promise<House> {
        if (this.houses.hasOwnProperty(owner)) {
            return this.houses[owner];
        } else {
            let house = await House.findByOwner(owner);
            this.houses[owner] = house;
            return house;
        }
    }
    

    /**
     * Looks up a wind turbine based on the given owner.
     * If it is not found then tries to load from database.
     * @param {string} owner the power plant uuid
     * @returns {Promise<PowerPlant>} the power plant if found
     */
    async powerPlant(owner: string): Promise<PowerPlant> {
        if (this.powerPlants.hasOwnProperty(owner)) {
            return this.powerPlants[owner];
        } else {
            let plant = await PowerPlant.findByOwner(owner);
            this.powerPlants[owner] = plant;
            return plant;
        }
    }
}


/**
 * Resource is a hashmap where uuid keys maps to resources
 * e.g. `Wind`, `House`...
 */
interface Map<T> {
    [key: string]: T;
}
