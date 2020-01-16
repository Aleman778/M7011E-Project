
/***************************************************************************
 * The market is used to buy and sell electricity between actors in
 * the simulation.
 ***************************************************************************/


/**
 * The market is controlled by a manager and is located in their power plant object.
 */
export default class Market {
    /**
     * The suggested price based on demand.
     */
    private _suggestedPrice: number;
    
    /**
     * Optionally set the current market price at the moment.
     */
    public _price?: number;

    /**
     * The current power sold to the market.
     */
    private _power: number;

    /**
     * The current market demand for electricity.
     */
    private _demand: number;

    /**
     * The number of actors buying and selling
     */
    private actors: number;


    /**
     * Creates a new market.
     */
    constructor() {
        this._suggestedPrice = 0;
        this._power = 0;
        this._demand = 0;
        this.actors = 0;
    }


    /**
     * Update the market price. This should be called last in step.
     */
    update() {
        let averageDemand = this._demand;
        if (this.actors >= 1) {
            averageDemand /= this.actors;
        }
        this._suggestedPrice = Math.max(15, 30 + averageDemand);
        this._power = 0;
        this._demand = 0;
        this.actors = 0;
    }
    

    /**
     * Buy electricity from the market.
     * @param {number} power the power to buy in kWh
     * @returns {number} the remaining if market is empty
     */
    buy(power: number): number {
        this._demand += power;
        this.actors++;
        if (this._power > power) {
            this._power -= power;
            return 0;
        } else {
            let remaining = power - this.power;
            this._power = 0;
            return remaining;
        }
    }
    

    /**
     * Sell electricity to the market.
     * @param {number} power the power to sell in kWh
     */
    sell(power: number) {
        this._power += power;
        this.actors++;
    }


    /**
     * Reset the market price and follow the suggested price.
     */
    resetPrice() {
        this._price = undefined;
    }


    /**
     * Setter for the current power.
     * @param {number} power the current market power
     */
    set power(power: number) {
        this._power = power;
    }


    /**
     * Setter for the current price.
     * @param {number} price the new price, must be larger then zero.
     */
    set price(price: number) {
        if (price > 0) {
            this._price = price
        }
    }

    
    /**
     * Getter for suggested price.
     * @returns {string} the suggested price
     */
    get suggestedPrice(): number {
        return this._suggestedPrice;
    }
    
    
    /**
     * Getter for the current market price.
     * @returns {string} the current price
     */
    get price(): number {
        if (this._price != undefined) {
            return this._price;
        } else {
            return this._suggestedPrice;
        }
    }

    
    /**
     * Getter for the current power stored in market.
     * @returns {string} the current power
     */
    get power(): number {
        return this._power;
    }

    
    /**
     * Getter for the total demand by prosumers.
     * @returns {string} the total demand
     */
    get demand(): number {
        return this._demand;
    }
}
