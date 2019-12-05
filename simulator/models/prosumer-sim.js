
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
    constructor(windSim, productScalar, consumeMax, consumeStdev, breakDownFreq, unit, bufferMax) {
        this.windSim = windSim;
        this.productScalar = productScalar;
        this.consumeMax = consumeMax;
        this.consumeStdev = consumeStdev;
        this.breakDownFreq = breakDownFreq;
        this.unit = unit;

        this.buffer = 0;
        this.bufferMax = bufferMax;
        this.bufferFactor = 0;
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
     *  Gets the buffer value.
     */
    getBufferValue() {
        return this.buffer;
    }


    /**
     *  Gets the buffers max value.
     */
    getBufferMax() {
        return this.bufferMax;
    }


    /**
     *  Gets the buffer factor which determine how many percent of the produced electricity is stored.
     */
    getBufferFactor() {
        return this.bufferFactor;
    }


    /**
     * Sets the new max buffer value.
     * @param {*} newBufferMax the new max buffer value. Must be zero or larger.
     */
    setBufferMax(newBufferMax) {
        if (newBufferMax >= 0) {
            this.bufferMax = newBufferMax;
            this.buffer = 0;
        }
    }


    /**
     * Sets the buffer factor which determine how many percent of the produced electricity is stored.
     * @param {*} newBufferFactor the new buffer factor. Must be equal or between 0 and 1.
     */
    setBufferFactor(newBufferFactor) {
        if (newBufferFactor >= 0 && newBufferFactor <= 1) {
            this.bufferFactor = newBufferFactor;
        }
    }
}

module.exports = ProsumerSim
