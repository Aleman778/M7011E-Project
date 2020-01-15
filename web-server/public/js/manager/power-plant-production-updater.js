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
        /**
         * @TODO Fetch Power plant production and battery data from web-server.
         */
        const response = await fetch(''); 
        const powerPlantData = await response.json();

        document.getElementById("plantProduction").innerHTML = "Production: " + powerPlantData.production;
        document.getElementById("plantProductionLevel").innerHTML = "Level: " + powerPlantData.level;
        document.getElementById("plantProductionCapacity").innerHTML = "Capacity: " + powerPlantData.capacity;
        document.getElementById("plantProductionVariant").innerHTML = "Variant: " + powerPlantData.variant;

        document.getElementById("plantBatteryValue").innerHTML = "Battery: " + powerPlantData.battery.value;
        document.getElementById("plantBatteryCapacity").innerHTML = "Capacity: " + powerPlantData.battery.capacity;
        document.getElementById("plantProductionRatio").innerHTML = "Ratio: " + powerPlantData.battery.ratio;
    } catch(error) {
        console.error(error);
        unloadPowerPlantProductionData();
        /**
         * @TODO Add an alert.
         */
    }
    
}
