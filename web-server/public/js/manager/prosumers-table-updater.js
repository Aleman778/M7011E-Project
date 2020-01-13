/******************************************************************************
 * Updates the prosumers account table.
 ******************************************************************************/


let intervalUpdateProsumersTable;


/**
 * Loads prosumer data into the table and sets interval for future updates.
 * Note: Call this when page is loaded.
 */
function loadProsumerTable() {
    updateProsumersTable();
    intervalUpdateProsumersTable = setInterval(updateProsumersTable, 5000);
};


/**
 * Clears intervals when page is closed.
 * Note: Call this when page is unloaded.
 */
function unloadProsumerTable() {
    this.clearInterval(intervalUpdateProsumersTable)
};


/**
 * Updates the prosumers table with the latest prosumer account data.
 */
async function updateProsumersTable() {
    const response = await fetch('/manager/prosumers/get', {
        method: 'POST', 
    });
    const prosumers = await response.json();
    const time = (new Date()).getTime();

    for (let i in prosumers) {
        let p = prosumers[i];
        document.getElementById(p.id + ".name").innerHTML = p.name;
        document.getElementById(p.id + ".email").innerHTML = p.email;
        document.getElementById(p.id + ".removed").innerHTML = p.removed;
        document.getElementById(p.id + ".created_at").innerHTML = p.created_at;
        if (p.removed) {
            document.getElementById(p.id + ".online").innerHTML = "";
            document.getElementById(p.id + ".blocked").innerHTML = "";
            document.getElementById(p.id + ".blackOut").innerHTML = "";
        } else {
            const online_at = (new Date(p.online_at)).getTime();
            document.getElementById(p.id + ".online").innerHTML = time - online_at <= 1000 * 60 * 5;
            document.getElementById(p.id + ".blocked").innerHTML = p.blocked;
            document.getElementById(p.id + ".blackOut").innerHTML = p.blackOut;
        }
    }
}
