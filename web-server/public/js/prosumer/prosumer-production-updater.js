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

    document.getElementById("prosumerConsumption").innerHTML = "Consumption: " +
        prosumerData.consumption.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumerProduction").innerHTML = "Production: " +
        prosumerData.production.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumerNetConsumption").innerHTML = "Net Consumption: " +
        (prosumerData.netConsumption).toFixed(3) + " " + prosumerData.unit;

    document.getElementById("battery").innerHTML = "Stored: " +
        (prosumerData.buffer.value).toFixed(3) + " " + prosumerData.unit;
    document.getElementById("batteryMax").innerHTML = "Max: " +
        (prosumerData.buffer.max) + " " + prosumerData.unit;
    document.getElementById("batteryExcessive").innerHTML = "Excessive Ratio: " +
        (prosumerData.buffer.excessiveProductionRatio * 100).toFixed(1) + " %" ;
    document.getElementById("batteryUnder").innerHTML = "Under Ratio: " +
        (prosumerData.buffer.underProductionRatio * 100).toFixed(1) + " %" ;
}
