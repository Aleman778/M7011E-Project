/******************************************************************************
 * Updates prosumer production and battery data text fields.
 ******************************************************************************/


let prosumerDataInterval;


/**
 * Starts a interval that updates the prosumers production and battery data fields.
 * Note: Call this when page is loaded.
 * @param {string} role the role of the user viewing the page.
 * @param {uuid.v4} prosumerIp the prosumers ip, is only needed if the role is manager.
 */
function loadProsumerDataUpdater(role, prosumerIp) {
    if (prosumerDataInterval != undefined) {
        clearInterval(prosumerDataInterval);
        prosumerDataInterval = undefined;
    }
    let productionQueryURL;
    let productionQueryBody;
    switch(role) {
        case 'prosumer':
            productionQueryURL = '/prosumer/house';
            productionQueryBody = {};
            break;
        case 'manager':
            productionQueryURL = '/manager/prosumer/production/get';
            productionQueryBody = {prosumerId: prosumerIp};
            break;
        default:
            console.log("ERROR: Variable role not set.")
            return;
    }
    prosumerDataInterval = setInterval(updateProsumersProductionFields, 100, productionQueryURL,
        productionQueryBody);
}


$(window).on( "unload", function() {
    if (prosumerDataInterval != undefined) {
        clearInterval(prosumerDataInterval);
        prosumerDataInterval = undefined;
    }
});


/**
 * Updates the prosumers production and battery data fields.
 */
async function updateProsumersProductionFields(productionQueryURL, productionQueryBody) {
    try {
        const response = await fetch(productionQueryURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productionQueryBody)
        });
        const data = await response.json();

        unit = " kWh";
        let consumption = data.consumption;
        let production = data.turbine.value;
        let netProduction = production - consumption;
        
        $("#prosumerConsumption span").html((consumption).toFixed(3) + unit);
        $("#prosumerProduction span").html((production).toFixed(3) + unit);
        $("#prosumerNetProduction span").html((netProduction).toFixed(3) + unit);
        $("#battery span").html((data.battery.value).toFixed(3) + unit);
        $("#batteryMax span").html((data.battery.capacity).toFixed(0) +unit);
        $("#batteryExcessive span").html((data.chargeRatio * 100).toFixed(1) + " %");
        $("#batteryUnder span").html((data.chargeRatio * 100).toFixed(1) + " %");

        let blockTimerOut = "No";
        if (data.blockTimer != 0) {
            blockTimerOut = data.blockTimer/1000 + " s";
        }
        $("#blockTimer span").html(blockTimerOut);
        $("#blackOut span").html(data.blackOut ? "Yes" : "No");
        $("#brokenTurbine span").html(data.turbine.broken ? "Yes" : "No");
        $("#repairTime span").html(data.turbine.repairTime/1000 + " s");
    } catch(error) {
        console.error(error);
        if (prosumerDataInterval != undefined) {
            clearInterval(prosumerDataInterval);
            prosumerDataInterval = undefined;
        }
        /**
         * @TODO Add an alert.
         */
    }
}
