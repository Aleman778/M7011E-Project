/******************************************************************************
 * Script for adding dynamic functionality to table. 
 ******************************************************************************/


/**
 * Sorts a table.
 * Note: Needs var tableId.
 * Taken From: https://www.w3schools.com/howto/howto_js_sort_table.asp (2020-01-10 15:30)
 * @param {*} n the column number.
 */
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(tableId);
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


/**
 * Filters table.
 * Note: Needs var inputFilterId.
 * @param {array<number>} columns the columns that can be filtered.
 */
function filterTable(columns) {
    // Declare variables
    let input = document.getElementById(inputFilterId);
    let filter = input.value.toUpperCase();
    let table = document.getElementById(tableId);
    let tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (var i = 0; i < tr.length; i++) {
        let td = [];
        for (var j = 0; j < columns.length; j++) {
            td.push(tr[i].getElementsByTagName("td")[columns[j]]);
        }

        let show = false;
        for (var j = 0; j < columns.length; j++) {
            if (td[j]) {
                let txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    show = true;
                    break;
                }
            }
        }

        if (show) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}
