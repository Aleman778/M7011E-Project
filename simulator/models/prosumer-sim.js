
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
        this.buffer.storingLimit = 0.75;
    }


    /**
     * Get the prosumers electricity consumption.
     */
    getElectricityConsumption(hour) {
        var step = (this.consumeStdev * 3.0) / 24.0;
        return this.windSim.gaussianDist(step * (hour - 12), this.consumeMax, 0, this.consumeStdev);
    }


    /**
     * Get the prosumers electricity production.
     */
    async getElectricityProduction(date) {
        var electricityProduced = await this.windSim.getWindSpeed(date) * this.productScalar;
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
     * @param {*} consumption the prosumers consumption.
     * @param {*} production the prosumers production
     */
    getNetConsumption(consumption, production) {
        var netConsumption = 0;
        this.buffer.value += production;
        var extraEnergy = Math.max(0, this.buffer.value - this.buffer.max * this.buffer.storingLimit);
        if (consumption > extraEnergy) {
            netConsumption = consumption - extraEnergy;
            this.buffer.value -= extraEnergy;
        } else {
            this.buffer.value -= consumption;
            if (this.buffer.value > this.buffer.max) {
                netConsumption = this.buffer.value - this.buffer.max;
                this.buffer.value = this.buffer.max
            }
        }

        return netConsumption;
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
     * Sets the new buffer storing limit, which sets a limit to when to start using the stored electricity.
     * @param {*} newBufferStoringLimit the new storing limit.
     */
    setBufferStoringLimit(newBufferStoringLimit) {
        if (newBufferStoringLimit >= 0 && newBufferStoringLimit <= 1) {
            this.buffer.storingLimit = newBufferStoringLimit;
        }
    }


    getId() {
        return this.id;
    }
}


module.exports = ProsumerSim
