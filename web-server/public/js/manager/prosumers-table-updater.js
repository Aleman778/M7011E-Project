
/******************************************************************************
 * Updates the prosumers account table.
 ******************************************************************************/


let tableInterval;


/**
 * Loads prosumer data into the table and sets interval for future updates.
 * Note: Call this when page is loaded.
 */
$(function() {
    updateProsumersTable();
    tableInterval = setInterval(updateProsumersTable, 1000);
});


/**
 * Blocks the prosumer with id prosumerId.
 * @param {*} prosumerId the prosumers id.
 */
function blockProsumer(prosumerId) {
    $.ajax({
        url: "/manager/prosumer/block",
        method: "POST",
        data: {
            prosumerId: prosumerId,
            timeout: $('#' + prosumerId + 'blockTimeInput').val()
        },
        headers: {}
    }).done(function(msg) {
        updateProsumersTable();
    }).fail(function(err) {
        alert(err);
    });
}


/**
 * Clears intervals.
 * Note: Call this when page is unloaded.
 */
function unloadTableUpdater() {
    if (tableInterval != undefined) {
        clearInterval(tableInterval);
        tableInterval = undefined;
    }
}


/**
 * Updates the prosumers table with the latest prosumer account data.
 */
async function updateProsumersTable() {
    try {
        const response = await fetch('/manager/prosumers/get', {
            method: 'POST', 
        });
        const data = await response.json();
        const time = (new Date()).getTime();
    
        for (let i in data.prosumers) {
            let prosumer = data.prosumers[i];
            let house = data.houses[i];
            $("." + prosumer.id + ".name").html(prosumer.name);
            $("." + prosumer.id + ".email").html(prosumer.email);
            $("." + prosumer.id + ".removed").html(prosumer.removed ? "Yes" : "No");
            $("." + prosumer.id + ".created_at").html(prosumer.created_at);
            if (prosumer.removed) {
                $("." + prosumer.id + ".online").html("");
                $("." + prosumer.id + ".blocked").html("");
                $("." + prosumer.id + ".blackOut").html("");
            } else {
                const online_at = (new Date(prosumer.online_at)).getTime();
                const isOnline = time - online_at <= 1000 * 60 * 5;
                const blocked = house.blockTimer > 0 ? (house.blockTimer/1000) + "s" : "No";
                $("." + prosumer.id + ".online").html(isOnline ? "Yes" : "No");
                $("." + prosumer.id + ".blocked").html(blocked);
                $("." + prosumer.id + ".blackOut").html(house.blackOut ? "Yes" : "No");
            }
        }
    } catch(error) {
        console.error(error);
        unloadProsumerTable();
        /**
         * @TODO Add an alert.
         */
    }
}
