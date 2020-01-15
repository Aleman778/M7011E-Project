/******************************************************************************
 * Updates power plant production and battery data field.
 ******************************************************************************/


let powerPlantProductionInterval;


/**
 * Starts a interval that updates the power plant production and battery data fields.
 * Note: Call this when page is loaded.
 */
function loadPowerPlantProductionData() {
    unloadPowerPlantProductionData();
    powerPlantProductionInterval = setInterval(updatePowerPlantProductionFields, 100);
}


/**
 * Clears the interval that updates the power plant production and battery data fields.
 * Note: Call this when page is unloaded.
 */
function unloadPowerPlantProductionData() {
    if (powerPlantProductionInterval != undefined) {
        clearInterval(powerPlantProductionInterval);
        powerPlantProductionInterval = undefined;
    }
}


/**
 * Updates the modelled price data field.
 */
async function updatePowerPlantProductionFields() {
    try {
        const response = await fetch('/manager/power-plant/get', {
            method: 'POST'
        });
        const powerPlantData = await response.json();

        document.getElementById("plantState").innerHTML = powerPlantData.state;

        document.getElementById("plantProduction").innerHTML = "Production: " 
            + (powerPlantData.market._power * (1/powerPlantData._marketRatio)).toFixed(1) 
            + " " + powerPlantData.unit;
        document.getElementById("plantProductionLevel").innerHTML = "Level: " 
            + powerPlantData._productionLevel.toFixed(0) + " " + powerPlantData.unit;
        document.getElementById("plantProductionCapacity").innerHTML = "Capacity: " 
            + powerPlantData.productionCapacity.toFixed(0) + " " + powerPlantData.unit;
        document.getElementById("plantProductionVariant").innerHTML = "Variant: " 
            + powerPlantData.productionVariant.toFixed(3) + " " + powerPlantData.unit;

        document.getElementById("plantBatteryValue").innerHTML = "Battery: " 
            + powerPlantData.battery._value.toFixed(3) + " " + powerPlantData.unit;
        document.getElementById("plantBatteryCapacity").innerHTML = "Capacity: " 
            + powerPlantData.battery._capacity.toFixed(0) + " " + powerPlantData.unit;
        document.getElementById("plantProductionRatio").innerHTML = "Market Ratio: " 
            + (powerPlantData._marketRatio * 100).toFixed(1) + "%";

        document.getElementById("marketDemand").innerHTML = "Demand: " 
            + powerPlantData.market._demand.toFixed(3) + "" + powerPlantData.unit;
        document.getElementById("marketPower").innerHTML = "Power: " 
            + powerPlantData.market._power.toFixed(3) + "" + powerPlantData.unit;
        document.getElementById("marketPrice").innerHTML = "Price: " + powerPlantData.market._price + " Öre/kwh"
        document.getElementById("marketModelledPrice").innerHTML = "Modelled Price: " 
            + powerPlantData.market._suggestedPrice.toFixed(2) + " Öre/kwh"
        document.getElementById("marketActors").innerHTML = "Number Of Costumers: " + powerPlantData.market.actors;
    } catch(error) {
        console.error(error);
        unloadPowerPlantProductionData();
        /**
         * @TODO Add an alert.
         */
    }
}
