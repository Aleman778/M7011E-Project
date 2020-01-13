/******************************************************************************
 * Updates the prosumers list every 5 seconds.
 ******************************************************************************/


let updateProsumersTable;
window.onload = function() {

    updateProsumersTable = setInterval(async function() {

        const response = await fetch('/manager/prosumers/get', {
            method: 'POST', 
        });
        const prosumers = await response.json();

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
                document.getElementById(p.id + ".online").innerHTML = p.online;
                document.getElementById(p.id + ".blocked").innerHTML = p.blocked;
                document.getElementById(p.id + ".blackOut").innerHTML = p.blackOut;
            }
        }
        
    }, 5000);
};

window.onunload = function() {
    this.clearInterval(updateProsumersTable)
};
