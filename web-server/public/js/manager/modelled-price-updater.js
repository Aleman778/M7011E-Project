/******************************************************************************
 * Updates modelled price data field.
 ******************************************************************************/


let modelledPriceInterval;


/**
 * Starts a interval that updates the modelled price data field.
 * Note: Call this when page is loaded.
 */
function loadModelledPriceData() {
    unloadModelledPriceData();
    modelledPriceInterval = setInterval(updateModelledPriceDataField, 100);
}


/**
 * Clears the interval that updates the modelled price data field.
 * Note: Call this when page is unloaded.
 */
function unloadModelledPriceData() {
    if (modelledPriceInterval != undefined) {
        clearInterval(modelledPriceInterval);
        modelledPriceInterval = undefined;
    }
}


/**
 * Updates the modelled price data field.
 */
async function updateModelledPriceDataField() {
    try {
        const response = await fetch('/manager/power-plant/market/suggested-price', {
            method: 'POST'
        });
        const modelledPrice = await response.json();
        document.getElementById("modelledPrice").innerHTML = modelledPrice.toFixed(3) + " Öre/h";
    } catch(error) {
        console.error(error);
        unloadModelledPriceData();
        /**
         * @TODO Add a alert.
         */
    }
}
