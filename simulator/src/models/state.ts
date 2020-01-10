
/***************************************************************************
 * The simulation state holds all the models relevant for this simulation.
 ***************************************************************************/

import uuid from "uuid";
import Wind from "./wind";
import House from "./house";
import WindTurbine from "./wind-turbine";
import PowerPlant from "./power-plant";
import Simulation from "../simulation";
import { ElectricityGridDB, eq } from "./database";


/**
 * The simuation state holds all models active in
 * the running simulation. 
 */
export default class SimulationState {
    /**
     * The simulation state id.
     */
    private _id: string;;
        
    /**
     * The main wind model.
     */
    private _wind: Wind;

    /**
     * All the houses models in this state.
     */
    private houses: Map<House>;
    
    /**
     * All the power plant models in this state.
     */
    private powerPlants: Map<PowerPlant>;
    
    
    /**
     * Creats a new simulation state.
     * @param {string} id the simulation uuid
     * @param {Wind} wind the wind main wind object
     * @param {Houses[]} houses the registered houses in this state
     * @param {PowerPlant[]} powerPlants the registered power plants in this state
     */
    constructor(
        id: string,
        wind: Wind,
        houses?: Map<House>,
        powerPlants?: Map<PowerPlant>
    ) {
        this._id = id;
        this._wind = wind;
        this.houses = houses || {};
        this.powerPlants = powerPlants || {};
    }


    /**
     * Generate a new simulation using random parameters.
     * These random variables are checked to be somewhat realistic.
     * @param {string} id the simulation state uuid
     * @returns {SimulationState} the generated state
     */
    static generate(id: string): SimulationState {
        let wind = Wind.generate();
        let state = new SimulationState(id, wind);
        return state;
    }
    

    /**
     * Restore the simulation state from previous checkpoint
     * stored in the database.
     * @param {string} id the simulation state uuid
     * @returns {Promise<SimulationState>} the restored state
     */
    static async restore(id: string): Promise<SimulationState> {
        try {
            let wind: Wind | undefined = undefined;
            let houses: Map<House> = {};
            let powerPlants: Map<PowerPlant> = {};
            let resources = await ElectricityGridDB.table('simulation_state').select([], [eq('id', id)]);
            for (let i in resources) {
                let r = resources[i];
                switch (r.resource_type) {
                    case 'wind':
                        wind = await Wind.findById(r.resource_id);
                        break;
                    case 'house':
                        houses[r.resource_id] = await House.findById(r.resource_id);
                        break;
                    case 'power_plant':
                        powerPlants[r.resource_id] = await PowerPlant.findById(r.resource_id);
                        break;
                    default:
                        throw new Error("Unknown resource type " + r.resource_type + ".");
                }
            }
            if (wind != undefined) {
                return new SimulationState(id, wind, houses, powerPlants);
            } else {
                throw new Error("There is no wind object defined simulation state of id: " + id + ".");
            }
        } catch(err) {
            console.trace(err);
            console.log("[SimulationState] Failed to restore from previous checkpoint");
            console.log("[SimulationState] Generating new simulation state...");
            return SimulationState.generate(id);
        }
    }

    
    /**
     * Update the simulation state variables.
     * @param {Simulation} sim the simulation instance
     */
    update(sim: Simulation) {
        this.wind.update(sim);
        for (let id in this.powerPlants) {
            this.powerPlants[id].update(sim, 0); /** @TODO Change 0 to demand. */ 
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
            let resources: SimulationStateData[] = [];
            await this.wind.store();
            resources.push({
                id: this.id,
                resource_id: this.wind.id,
                resource_type: 'wind'
            });

            for (let rid in this.houses) {
                await this.houses[rid].store();
                resources.push({
                    id: this.id,
                    resource_id: rid,
                    resource_type: 'house',
                });
            }
            
            for (let rid in this.powerPlants) {
                await this.powerPlants[rid].store(sim);
                resources.push({
                    id: this.id,
                    resource_id: rid,
                    resource_type: 'power_plant',
                });
            }

            for (let rid in resources) {
                await ElectricityGridDB.table('simulation_state')
                    .insert_or_update(resources[rid], ['id', 'resource_id']);
            }
        } catch(err) {
            console.trace(err);
        }
    }


    /**
     * Looks up a house based on the given id.
     * If it is not found then tries to load from database.
     * @param {string} id the house uuid
     * @returns {Promise<House>} the house if found
     */
    async house(id: string): Promise<House> {
        if (this.houses.hasOwnProperty(id)) {
            return this.houses[id];
        } else {
            let house = await House.findById(id);
            this.houses[id] = house;
            return house;
        }
    }


    /**
     * Register a new house in the simulation.
     */
    async registerHouse(owner: string) {
        let house = House.generate(owner);
        this.houses[house.id] = house;
    }


    async deleteHouse(owner: string) {
        
    }
    

    /**
     * Looks up a wind turbine based on the given id.
     * If it is not found then tries to load from database.
     * @param {string} id the power plant uuid
     * @returns {Promise<PowerPlant>} the power plant if found
     */
    async powerPlant(id: string): Promise<PowerPlant> {
        if (this.powerPlants.hasOwnProperty(id)) {
            return this.powerPlants[id];
        } else {
            let plant = await PowerPlant.findById(id);
            this.powerPlants[id] = plant;
            return plant;
        }
    }


    /**
     * Register a new power plant in the simulation.
     */
    registerPowerPlant(owner: string) {

    }
    
    
    /**
     * Getter for the main wind in this simulation state.
     * @returns {Wind} the main wind object
     */
    get wind(): Wind {
        return this._wind;
    }


    /**
     * Getter for the simulation state id.
     * @param {string} id the sim state id
     */
    get id(): string {
        return this._id;
    }
}


/**
 * Resource is a hashmap where uuid keys maps to resources
 * e.g. `Wind`, `House`...
 */
interface Map<T> {
    [key: string]: T;
}


/**
 * Simulation state data from table `simulation_state`.
 * Stores one resource of id and type, the available types are
 * the following: `wind`, `house` and `power_plant`.
 */
interface SimulationStateData {
    readonly id: string,
    readonly resource_id: string,
    readonly resource_type: string,
}
