/******************************************************************************
 * Defines functions for updating power plant settings.
 ******************************************************************************/


/**
 * Updates the power plant level.
 * @param {string} inputId the id of the input field.
 */
async function updatePowerPlantLevel(inputId) {
    let newLevel = document.getElementById(inputId).value;
    await fetch('/manager/power-plant/production/level', {
        method: 'PUT',
        headers: {
         'Content-type': 'application/json; charset=UTF-8'  
        },
        body: JSON.stringify({newLevel: newLevel/3600})
    });
}


/**
 * Updates the power plant market ratio.
 * @param {string} inputId the id of the input field.
 */
async function updatePowerPlantMarketRatio(inputId) {
    let newRatio = document.getElementById(inputId).value;
    await fetch('/manager/power-plant/market-ratio', {
        method: 'PUT',
        headers: {
         'Content-type': 'application/json; charset=UTF-8'  
        },
        body: JSON.stringify({newRatio: newRatio})
    });
}


/**
 * Updates the power plant market price.
 * @param {string} inputId the id of the input field.
 */
async function updatePowerPlantMarketPrice(inputId) {
    let newPrice = document.getElementById(inputId).value;
    await fetch('/manager/market/price', {
        method: 'PUT',
        headers: {
         'Content-type': 'application/json; charset=UTF-8'  
        },
        body: JSON.stringify({newPrice: newPrice})
    });
}


/**
 * Starts the power plant.
 */
async function updatePowerPlantStart() {
    await fetch('/manager/power-plant/start', {
        method: 'POST'
    });
    let btnStart = $("#btnStart");
    btnStart.blur();
}


/**
 * Stops the power plant.
 */
async function updatePowerPlantStop() {
    await fetch('/manager/power-plant/stop', {
        method: 'POST'
    });
    let btnStop = $("#btnStop");
    btnStop.blur();
}
