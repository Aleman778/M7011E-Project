/******************************************************************************
 * Updates the prosumer info every 5 seconds.
 ******************************************************************************/


let updateProsumerInfo;
window.onload = function() {
    updateProsumerInfo = setInterval(async function() {
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

        document.getElementById("prosumerId").innerHTML = "Id:" + prosumer.id;
        document.getElementById("prosumerName").innerHTML = "Name: " + prosumer.name;
        document.getElementById("prosumerEmail").innerHTML = "Email: " + prosumer.email;
        document.getElementById("prosumerRole").innerHTML = "Role: " + prosumer.role;
        document.getElementById("prosumerCreatedAt").innerHTML = "Created at: " + prosumer.created_at;
        document.getElementById("prosumerUpdatedAt").innerHTML = "Updated at: " + prosumer.updated_at;
        document.getElementById("prosumerOnline").innerHTML = "Online: " + prosumer.online;
        document.getElementById("prosumerRemoved").innerHTML = "Removed: " + prosumer.removed;
        document.getElementById("prosumerBlackOut").innerHTML = "Black-out: " + prosumer.blackOut;
        
    }, 5000);
};

window.onunload = function() {
    this.clearInterval(updateProsumerInfo)
};
