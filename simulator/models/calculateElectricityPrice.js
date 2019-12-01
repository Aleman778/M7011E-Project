/**
 * The current electricity price can then be derived using the electricity consumption (demand) and wind speed 
 * (supply of cheaper power) using for example a simple linear function.
 */

/**
 * Calculates the electricity price form the demand and wind speed
 * @param {*} demand is the electricity consumption.
 */
exports.calculateElectricityPrice = function (demand) {
    return Math.max(15, 30 + demand);
}
