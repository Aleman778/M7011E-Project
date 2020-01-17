/******************************************************************************
 * Updates the wind speed field.
 ******************************************************************************/


let windInterval;


/**
 * Starts an interval that updates the wind speed field.
 */
$(function() {
    if (windInterval != undefined) {
        clearInterval(windInterval);
        windInterval = undefined;
    }
    windInterval = setInterval(updateWindSpeedDataField, 100);
});


$(window).on("unload", function() {
    if (windInterval != undefined) {
        clearInterval(windInterval);
        windInterval = undefined;
    }
});


/**
 * Updates the wind speed data field.
 */
async function updateWindSpeedDataField() {
    try {
        const response = await fetch('http://localhost:3000/api/wind');
        const windData = await response.json();
        $("#windSpeed span").html(windData.value.toFixed(3) + " " + windData.unit);
    } catch(error) {
        console.error(error);
        if (windInterval != undefined) {
            clearInterval(windInterval);
            windInterval = undefined;
        }
        /**
         * @TODO Add a alert.
         */
    }
}
