/**
 * The current electricity price can then be derived using the electricity consumption (demand) and wind speed 
 * (supply of cheaper power) using for example a simple linear function.
 */

/**
 * Calculates the electricity price form the demand and windspeed
 * @param {*} demand is the electricity consumption.
 * @param {*} windSpeed is the speed of the wind.
 */
function calculateElectricityPrice(demand, windSpeed) {
    return 30 + demand/2 - windSpeed;
}
