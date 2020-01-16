
/******************************************************************************
 * Updates a current market field.
 ******************************************************************************/

let marketFieldInterval;


$(function() {
    updateMarketFields();
    priceFieldInterval = setInterval(updatePriceField, 100);
});


$(window).on( "unload", function() {
    if (priceFieldInterval != undefined) {
        clearInterval(priceFieldInterval);
        priceFieldInterval = undefined;
    }
});


/**
 * Updates the market fields.
 */
async function updateMarketFields() {
    try {
        const response = await fetch('/prosumer/market', {
            method: 'POST'
        });
        const market = await response.json();

        $("#price span").html(market._price || "...");
        $("#power span").html(market._power.toFixed(3) + " kwh");
        $("#demand span").html(market._demand + " kwh");
        $("#actors span").html(market.actors + " st");
    } catch(error) {
        console.error(error);
        clearInterval(priceFieldInterval);
        priceFieldInterval = undefined;
        /**
         * @TODO Add an alert.
         */
    }   
}
