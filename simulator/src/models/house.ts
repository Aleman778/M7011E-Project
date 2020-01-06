
/***************************************************************************
 * The house model is used to keep track of eletricity consumption
 * and eventually the production of their wind tubine.
 ***************************************************************************/


import uuid.v4 from "uuid";
import Battery from "./battery";
import WindTurbine from "./turbine";


/**
 * The house model defines the 
 */
export default class House {
    /**
     * The house uuid.
     */
    private _id: uuid.v4;
    
    /**
     * The uuid of the house owner.
     */
    private _owner: uuid.v4;

    /**
     * The battery connected to this house.
     */
    private battery: Battery;

    /**
     * The wind turbine connected to this house.
     */
    private windTurbine: WindTurbine;
    
    
    /**
     * Creats a new house model
     */
    constructor(
        id: uuid.v4,
        owner: uuid.v4,
        battery: Battery,
        windTurbine: WindTurbine,
    ) {
        this._id = id;
        this._owner = owner;
        this.battery = battery;
        this.windTurbine = windTurbine;
    }


    update(sim: Simulation) {

    }


    store() {
        
    }

    
    /**
     * Getter for the uuid of the house owner.
     * @returns {uuid.v4} the owner uuid
     */
    get owner() {
        return owner;
    }
}


export interface 
