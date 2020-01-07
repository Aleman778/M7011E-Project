/************************************************************
 * Adds all prosumers in the list prosumers to the prosumers 
 * list on the page.
 ************************************************************/

var table = document.getElementById("prosumerTable");

for (var p in prosumers) {
    let row = table.insertRow(p);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);
    let cell4 = row.insertCell(4);
    let cell5 = row.insertCell(5);

    cell0.innerHTML = true;
    cell1.innerHTML = prosumers[p].name;
    cell2.innerHTML = prosumers[p].email;
    cell3.innerHTML = prosumers[p].removed;
    cell4.innerHTML = prosumers[p].created_at;
    cell5.innerHTML = '<button class="btn"><span class="octicon octicon-info"></span></button>'
        + '<button class="btn"><span class="octicon octicon-circle-slash"></span></button>'
        + '<button class="btn"><span class="octicon octicon-x"></span></button>';
}
