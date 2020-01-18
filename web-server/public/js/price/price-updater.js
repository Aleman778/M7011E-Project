
/******************************************************************************
 * Updates a current electricity price field.
 ******************************************************************************/

let priceFieldInterval;


$(function() {
    if (role == 'prosumer' || role == 'manager') {
        if (priceFieldInterval != undefined) {
            clearInterval(priceFieldInterval);
            priceFieldInterval = undefined;
        }
        priceFieldInterval = setInterval(updatePriceField, 100);
    } else {
        console.log("Error: Var role must be set.");
    }
    
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
        const response = await fetch('/' + role + '/market/price', {
            method: 'POST'
        });
        const price = await response.json();

        $("#price span").html(parseFloat(price).toFixed(2));
    } catch(error) {
        console.error(error);
        clearInterval(priceFieldInterval);
        priceFieldInterval = undefined;
        /**
         * @TODO Add an alert.
         */
    }   
}
