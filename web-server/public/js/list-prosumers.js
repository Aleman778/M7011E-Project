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
    let cell6 = row.insertCell(6);

    cell0.innerHTML = true;
    cell1.innerHTML = prosumers[p].name;
    cell2.innerHTML = prosumers[p].email;
    cell3.innerHTML = prosumers[p].removed;
    cell4.innerHTML = prosumers[p].created_at;
    cell5.innerHTML = false;
    cell6.innerHTML = ''
        + '<div class="button-container">'
        +   '<form action="/manager/prosumer/info" method="POST">'
        +       '<button class="btn octicon octicon-info" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        +   '|'
        +   '<form action="/manager/block/prosumer" method="POST">'
        +       '<input type="number" name="timeout" min="10" max="100" size="3">'
        +       '<button class="btn octicon octicon-circle-slash" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        +   '|'
        +   '<form action="/manager/remove/prosumer" method="POST">'
        +       '<button class="btn octicon octicon-x" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        + '</div>';
}
