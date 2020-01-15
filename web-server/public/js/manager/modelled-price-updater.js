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
    /**
     * @TODO Fixed file when there is a api for getting modelled price.
     */
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
        /**
         * @TODO Add a query for getting modelled price.
         */
        const priceData = await response.json();
        document.getElementById("modelledPrice").innerHTML = priceData.electricity_price.toFixed(3) + " " + priceData.unit;
    } catch(error) {
        console.error(error);
        unloadModelledPriceData();
        /**
         * @TODO Add a alert.
         */
    }
}
