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
    let cell7 = row.insertCell(7);
    let cell8 = row.insertCell(8);

    cell0.innerHTML = true;
    cell1.innerHTML = "<%- include('./avatar', {user: " + prosumers[p] + ", size: 30})%>";
    cell2.innerHTML = prosumers[p].name;
    cell3.innerHTML = prosumers[p].email;
    cell4.innerHTML = prosumers[p].removed;
    cell5.innerHTML = prosumers[p].created_at;
    cell6.innerHTML = false;
    cell7.innerHTML = false;
    cell8.innerHTML = ''
        + '<div class="button-container">'
        +   '<form action="/manager/prosumer/info" method="POST">'
        +       '<button class="btn octicon octicon-info" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        +   '|'
        +   '<form action="/manager/block/prosumer" method="POST">'
        +       '<input type="number" name="timeout" min="10" max="100" size="3" value="10">'
        +       '<button class="btn octicon octicon-circle-slash" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        +   '|'
        +   '<form action="/manager/remove/prosumer" method="POST">'
        +       '<button class="btn octicon octicon-x" type="submit" name="prosumerId" value="' + prosumers[p].id + '"></button>'
        +   '</form>'
        + '</div>';
}
