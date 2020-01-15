/******************************************************************************
 * Updates the wind speed field.
 ******************************************************************************/


let windInterval;


/**
 * Starts an interval that updates the wind speed field.
 * Note: Call this when the page is loaded.
 */
function loadWindSpeedData() {
    if (windInterval != undefined) {
        clearInterval(windInterval);
    }
    windInterval = setInterval(updateWindSpeedDataField, 100);
}


/**
 * Clear the interval that updates the wind speed field.
 * Note: Call this when the page is unloaded.
 */
function unloadWindSpeedData() {
    clearInterval(windInterval);
}


/**
 * Updates the wind speed data field.
 */
async function updateWindSpeedDataField() {
    const response = await fetch('http://localhost:3000/api/wind');
    const windData = await response.json();
    document.getElementById("windSpeed").innerHTML = windData.value.toFixed(3) + " " + windData.unit;
}
