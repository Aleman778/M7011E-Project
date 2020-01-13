/******************************************************************************
 * Updates the prosumer account data fields.
 ******************************************************************************/


let intervalUpdateProsumerInfo;


/**
 * Gets the prosumers account data and sets an interval for future updates.
 * Note: Call this when page is loaded.
 */
function loadUpdateProsumerAccountData(prosumerId) {
    updateProsumerInfo(prosumerId);
    intervalUpdateProsumerInfo = setInterval(updateProsumerInfo, 5000, prosumerId);
};


/**
 * Clears the interval that updates the prosumers data when the page is closed.
 * Note: Call this when page is unloaded.
 */
function unloadUpdateProsumerAccountData() {
    clearInterval(intervalUpdateProsumerInfo)
};


/**
 * Updates the prosumers account data fields.
 */
async function updateProsumerInfo(prosumerId) {
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

    document.getElementById("prosumerId").innerHTML = "Id: " + prosumer.id;
    document.getElementById("prosumerName").innerHTML = "Name: " + prosumer.name;
    document.getElementById("prosumerEmail").innerHTML = "Email: " + prosumer.email;
    document.getElementById("prosumerRole").innerHTML = "Role: " + prosumer.role;
    document.getElementById("prosumerCreatedAt").innerHTML = "Created at: " + prosumer.created_at;
    document.getElementById("prosumerUpdatedAt").innerHTML = "Updated at: " + prosumer.updated_at;
    const isOnline = (new Date()).getTime() - (new Date(prosumer.online_at)).getTime() <= 1000 * 60 * 5;
    document.getElementById("prosumerOnline").innerHTML = "Online: " +  isOnline;
    document.getElementById("prosumerRemoved").innerHTML = "Removed: " + prosumer.removed;
    document.getElementById("prosumerBlackOut").innerHTML = "Black-out: " + prosumer.blackOut;
}
