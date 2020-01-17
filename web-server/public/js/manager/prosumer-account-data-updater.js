/******************************************************************************
 * Updates the prosumer account data fields.
 ******************************************************************************/


let intervalUpdateProsumerInfo;


/**
 * Gets the prosumers account data and sets an interval for future updates.
 */
$(function() {
    if (intervalUpdateProsumerInfo != undefined) {
        clearInterval(intervalUpdateProsumerInfo)
        intervalUpdateProsumerInfo = undefined;
    }
    updateProsumerInfo(prosumerId);
    intervalUpdateProsumerInfo = setInterval(updateProsumerInfo, 5000, prosumerId);
});


/**
 * Clears the interval that updates the prosumers data.
 */
$(window).on( "unload", function() {
    if (intervalUpdateProsumerInfo != undefined) {
        clearInterval(intervalUpdateProsumerInfo)
        intervalUpdateProsumerInfo = undefined;
    }
});


/**
 * Updates the prosumers account data fields.
 */
async function updateProsumerInfo(prosumerId) {
    try {
        const response = await fetch('/manager/prosumer/get', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prosumerId: prosumerId,
            }),
        });
        const prosumer = await response.json();
    
        $("#prosumerId span").html(prosumer.id);
        $("#prosumerName span").html(prosumer.name);
        $("#prosumerEmail span").html(prosumer.email);
        $("#prosumerRole span").html(prosumer.role);
        $("#prosumerCreatedAt span").html(prosumer.created_at);
        $("#prosumerUpdatedAt span").html(prosumer.updated_at);
        const isOnline = (new Date()).getTime() - (new Date(prosumer.online_at)).getTime() <= 1000 * 60 * 5;
        $("#prosumerOnline span").html(isOnline ? "Yes" : "No");
        $("#prosumerRemoved span").html(prosumer.removed ? "Yes" : "No");
    } catch(error) {
        console.error(error);
        clearInterval(intervalUpdateProsumerInfo)
        intervalUpdateProsumerInfo = undefined;
        /**
         * @TODO Add an alert.
         */
    }
}
