
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
     * The uuid of the house owner.
     */
    private _owner: uuid.v4;

    
    /**
     * Creats a new house model
     */
    constructor(
        owner: uuid.v4,
        battery: Battery,
    ) {
        this._owner = owner;
    }
}
