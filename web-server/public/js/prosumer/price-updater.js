
/******************************************************************************
 * Updates a current electricity price field.
 ******************************************************************************/

let priceFieldInterval;


$(function() {
    priceFieldInterval = setInterval(updatePriceField, 100);
});


$(window).on( "unload", function() {
    if (priceFieldInterval != undefined) {
        clearInterval(priceFieldInterval);
        priceFieldInterval = undefined;
    }
});


/**
 * Updates the current price field.
 */
async function updatePriceField() {
    try {
        const response = await fetch('/prosumer/market/price', {
            method: 'POST'
        });
        const price = await response.json();

        $("#price span").html(price || "...");
    } catch(error) {
        console.error(error);
        clearInterval(priceFieldInterval);
        priceFieldInterval = undefined;
        /**
         * @TODO Add an alert.
         */
    }   
}
