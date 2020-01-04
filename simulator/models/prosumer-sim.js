const electricityGridDB = require('./electricity-grid-queries.js');


/**
 * Model of a household’s electricity consumption and production.
 * For electricity consumption simply sample a Gaussian distribution.
 * The Prosumer’s production of electricity is dependent on the wind.
 */
class ProsumerSim {
    /**
     * Creates a new prosumer simulator given the wind simulator
     * and consumption attributes.
     * @param windSim the wind simulator
     * @param productScalar the electricity production scalar value
     * @param consumeMax the max electricity consumption value
     * @param consumeStdev the standard deviation of electricity consumption
     * @param breakDownFreq the chance(in percent %) that zero electricity is produced this hour.
     * @param bufferMax the max electricity the buffer can hold.
     */
    constructor(id, windSim, productScalar, consumeMax, consumeStdev, breakDownFreq, unit, bufferMax) {
        this.id = id;
        this.windSim = windSim;
        this.productScalar = productScalar;
        this.consumeMax = consumeMax;
        this.consumeStdev = consumeStdev;
        this.breakDownFreq = breakDownFreq;
        this.unit = unit;

        this.buffer = {};
        this.buffer.value = 0;
        this.buffer.max = bufferMax;
        this.buffer.excessiveProductionRatio = 0; 
        this.buffer.underProductionRatio = 0;
    }


    /**
     * Get the prosumers electricity consumption.
     */
    async getElectricityConsumption(date) {
        var near = await electricityGridDB.getNearestProsumerData(this.id, date.getTime()/1000);
        if (near[0] == null || near[1] == null) {
            console.log('Log: date  = ' + date);
            console.log('Log: prosumer data  = ' + near[0]);
            console.log('Log: prosumer data  = ' + near[1]);
            return null;
        }
        var lDate = new Date(near[0].time);
        var hDate = new Date(near[1].time);
        return (near[1].consumption - near[0].consumption)/(hDate.getTime() - lDate.getTime()) * ((date.getTime()) - near[0].time);
    }


    /**
     * Simulates the prosumers electricity consumption.
     */
    simulateElectricityConsumption(date) {
        var step = (this.consumeStdev * 3.0) / 24.0;
        return this.windSim.gaussianDist(step * (date.getHours() - 12), this.consumeMax, 0, this.consumeStdev);
    }


    /**
     * Get the prosumers electricity production.
     */
    async getElectricityProduction(date) {
        var near = await electricityGridDB.getNearestProsumerData(this.id, date.getTime()/1000);
        if (near[0] == null || near[1] == null) {
            console.log('Log: date  = ' + date);
            console.log('Log: prosumer data  = ' + near[0]);
            console.log('Log: prosumer data  = ' + near[1]);
            return null;
        }
        var lDate = new Date(near[0].time);
        var hDate = new Date(near[1].time);
        return (near[1].production - near[0].production)/(hDate.getTime() - lDate.getTime()) * ((date.getTime()) - near[0].time);
    }


     /**
     * Simulates the electricity production.
     */
    async simulateElectricityProduction(date) {
        const wind = await this.windSim.getWindSpeed(date);
        console.log('Log: wind = ' + wind);
        console.log('Log: date = ' + date);
        var electricityProduced = wind * this.productScalar;

        var rand = Math.round(Math.random() * 100);
        if (rand < this.breakDownFreq) {
            electricityProduced = 0;
        }

        return electricityProduced;
    }


    /**
     * Calculates the amount of electricity consumed from the electricity network
     * NOTE: The return value can be positive or negative.
     * NOTE: This function updates the buffer.
     * @param {*} date
     */
    async getNetConsumption(date) {
        var near = await electricityGridDB.getNearestProsumerData(this.id, date.getTime()/1000);
        if (near[0] == null || near[1] == null) {
            console.log('Log: Wind 0 = ' + near[0]);
            console.log('Log: Wind 1 = ' + near[1]);
            return null;
        }
        var lDate = new Date(near[0].time);
        var hDate = new Date(near[1].time);
        return (near[1].net_consumption - near[0].net_consumption)/(hDate.getTime() - lDate.getTime()) * ((date.getTime()) - near[0].time);
    }

    
    /**
     * Calculates the amount of electricity consumed from the electricity network
     * NOTE: The return value can be positive or negative.
     * NOTE: This function updates the buffer.
     * @param {*} consumption the prosumers consumption.
     * @param {*} production the prosumers production
     */
    simulateNetConsumption(consumption, production) {
        var excessiveProduction = production - consumption;
        if (excessiveProduction < 0) {
            var fromBuffer = Math.min(this.buffer.value, -excessiveProduction * this.buffer.underProductionRatio);
            this.buffer.value -= fromBuffer;
            return -excessiveProduction - fromBuffer;
        } else if (excessiveProduction > 0) {
            var toBuffer = Math.min(this.buffer.max - this.buffer.value, excessiveProduction * this.buffer.excessiveProductionRatio);
            this.buffer.value += toBuffer;
            return toBuffer - excessiveProduction;
        } else {
            return 0;
        }
    }


    /**
     *  Gets the buffer obj.
     */
    getBuffer() {
        return this.buffer;
    }


    /**
     * Sets the new max buffer value.
     * @param {*} newBufferMax the new max buffer value. Must be zero or larger.
     */
    setBufferMax(newBufferMax) {
        if (newBufferMax >= 0) {
            this.buffer.max = newBufferMax;
            this.buffer.value = 0;
        }
    }


    /**
     * Sets the buffers excessive production ratio, which controls the percentage of excessive electricity being stored.
     * @param {*} newExcessiveProductionRatio the new excessive production ratio.
     */
    setBufferExcessiveProductionRatio(newExcessiveProductionRatio) {
        if (newExcessiveProductionRatio >= 0 && newExcessiveProductionRatio <= 1) {
            this.buffer.excessiveProductionRatio = newExcessiveProductionRatio;
        }
    }


    /**
     * Sets the buffers under production ratio, which controls the percentage of electricity taken from the buffer.
     * @param {*} newUnderProductionRatio the new under production ratio.
     */
    setBufferUnderProductionRatio(newUnderProductionRatio) {
        if (newUnderProductionRatio >= 0 && newUnderProductionRatio <= 1) {
            this.buffer.underProductionRatio = newUnderProductionRatio;
        }
    }


    /**
     * Returns the prosumers id.
     */
    getId() {
        return this.id;
    }
}


module.exports = ProsumerSim
