
/***************************************************************************
 * The battery model is used to keep track of stored electricity and
 * defines also the capacity of the battey.
 ***************************************************************************/


import uuid from "uuid";


/**
 * The battery model defines the state of a battery.
 */
export default class Battery {
    /**
     * The uuid of the battery owner.
     */
    private _owner: uuid.v4;

    /**
     * The maximum capacity of the battery
     */
    private _capacity: number;
    
    /**
     * The current value of the battery.
     */
    private _value: number;


    /**
     * Creates a new battery model with specific owner, capacity and value.
     * @param {uuid.v4} owner the owner uuid
     * @param {number} capacity the battery capacity
     * @param {number} value the new battery value
     */
    constructor(owner: uuid.v4, capacity: number, value: number = 0) {
        this._owner = owner;
        this._capacity = capacity;
        this._value = value;
    }


    /**
     * Set the battery value, has to be between 0 and capacity.
     * @param {number} value the new battery value
     */
    set value(value: number) {
        if (value < 0) {
            this._value = 0;
        } else if (value > this._capacity) {
            this._value = this._capacity;
        } else {
            this._value = value;
        }
    }

    
    /**
     * Get the uuid of the battery owner.
     * @returns {uuid.v4} the owner uuid
     */
    get owner(): number {
        return this._owner;
    }

    
    /**
     * Get the battery capacity.
     * @returns {number} the battery capacity.
     */
    get capacity(): number {
        return this._capacity;
    }

    
    /**
     * Get the current battery value.
     * @returns {number} the battery value.
     */
    get value(): number {
        return this._value;
    }
}
