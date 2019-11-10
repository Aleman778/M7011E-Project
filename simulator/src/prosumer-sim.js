
/**
 * Model of a household’s electricity consumption and production.
 * For electricity consumption simply sample a Gaussian distribution.
 * The Prosumer’s production of electricity is dependent on the wind.
 */
class ProsumerSim {
    /**
     * Creates a new prosumer simulator given the wind simulator
     * and consumation attributes.
     * @param windSim the wind simulator
     * @param productScalar the electricity production scalar value
     * @param consumeMax the max electricity consumation value
     * @param consumeStdev the standard deviation of electricity consumation
     */
    constructor(windSim, productScalar, consumeMax, consumeStdev) {
        this.windSim = windSim;
        this.productScalar = productScalar;
        this.consumeMax = consumeMax;
        this.consumeStdev = consumeStdev;
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
    getElectricityProduction(hour) {
        return this.windSim.getWindSpeed(hour) * this.productScalar;
    }
}

module.exports = ProsumerSim
