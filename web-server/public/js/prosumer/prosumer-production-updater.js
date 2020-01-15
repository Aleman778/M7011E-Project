/******************************************************************************
 * Updates prosumer production and battery data text fields.
 ******************************************************************************/


let prosumerDataInterval;


/**
 * Starts a interval that updates the prosumers production and battery data fields.
 * Note: Call this when page is loaded.
 * @param {string} role the role of the user viewing the page.
 * @param {uuid.v4} prosumerIp the prosumers ip, is only needed if the role is manager.
 */
function loadProsumerDataUpdater(role, prosumerIp) {
    let productionQueryURL;
    let productionQueryBody;
    switch(role) {
        case 'prosumer':
            productionQueryURL = '/prosumer/production/get';
            productionQueryBody = {};
            break;
        case 'manager':
            productionQueryURL = '/manager/prosumer/production/get';
            productionQueryBody = {prosumerId: prosumerIp};
            break;
        default:
            console.log("ERROR: Variable role not set.")
            return;
    }
    prosumerDataInterval = setInterval(updateProsumersProductionFields, 100, productionQueryURL,
        productionQueryBody);
}


/**
 * Clears the interval for updating the prosumers production and battery data fields.
 * Note: Call this when page is unloaded.
 */
function unloadProsumerDataUpdater() {
    clearInterval(prosumerDataInterval);
}


/**
 * Updates the prosumers production and battery data fields.
 */
async function updateProsumersProductionFields(productionQueryURL, productionQueryBody) {
    const response = await fetch(productionQueryURL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productionQueryBody)
    });
    const prosumerData = await response.json();
    unit = "kwh";

    document.getElementById("prosumerConsumption").innerHTML = "Consumption: @TODO";
    document.getElementById("prosumerProduction").innerHTML = "Production: " +
        (prosumerData.turbine._currentPower * 1000).toFixed(3) + " wh";
    document.getElementById("prosumerNetConsumption").innerHTML = "Net Consumption: @TODO";

    document.getElementById("battery").innerHTML = "Stored: " +
        (prosumerData.battery._value).toFixed(3) + " " + unit;
    document.getElementById("batteryMax").innerHTML = "Capacity: " +
        (prosumerData.battery._capacity).toFixed(0) + " " + unit;
    document.getElementById("batteryExcessive").innerHTML = "Charge Ratio: " +
        (prosumerData._chargeRatio * 100).toFixed(1) + " %" ;
    document.getElementById("batteryUnder").innerHTML = "Consume Ratio: " +
        (prosumerData._consumeRatio * 100).toFixed(1) + " %" ;
}
