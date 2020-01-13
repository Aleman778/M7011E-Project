
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
    private _owner: string;

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
     * @param {string} owner the owner uuid
     * @param {number} capacity the battery capacity
     * @param {number} value the new battery value
     */
    constructor(owner: string, capacity: number, value: number = 0) {
        this._owner = owner;
        this._capacity = capacity;
        this._value = value;
    }


    /**
     * Charges the battery with the given power. 
     * When the battery becomes full then the excess power is returned.
     * @param {number} power the power to charge
     * @param {number} ratio only charge a ratio of the given power.
     * @returns {number} the power left after charging
     */
    charge(power: number, ratio: number): number {
        if (power < 0) {
            throw Error("Cannot charge negative amount of power.");
        }
        if (ratio < 0 || ratio > 1) {
            throw Error("Cannot use charge ratio outside range [0, 1].");
        }
        let remaining = this.capacity - this.value;
        if (power * ratio > remaining) {
            this.value += remaining;
            return power - remaining;
        } else {
            this.value += power * ratio;
            return power * (1 / ratio);
        }
    }

    
    /**
     * Consumes the battery with the given power.
     * When the battery becomes empty then the remaining power is returned.
     * @param {number} power the power to consume
     * @param {number} ratio only consume a ratio of the given power.
     * @returns {number} the power left unconsumed
     */
    consume(power: number, ratio: number): number {
        if (power < 0) {
            throw Error("Cannot consume negative amount of power.");
        }
        if (ratio < 0 || ratio > 1) {
            throw Error("Cannot use consume ratio outside range [0, 1].");
        }
        if (power * ratio > this.value) {
            let remaining = power - this.value;
            this.value = 0;
            return remaining;
        } else {
            this.value = this.value - power * ratio;
            return power * (1.0 - ratio);
        }
    }
    

    /**
     * Set the battery value, has to be between 0 and capacity.
     * @param {number} value the new battery value
     */
    set value(value: number) {
        if (value < 0) {
            this._value = 0;
        } else if (value > this.capacity) {
            this._value = this.capacity;
        } else {
            this._value = value;
        }
    }

    
    /**
     * Get the uuid of the battery owner.
     * @returns {string} the owner uuid
     */
    get owner(): string {
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
