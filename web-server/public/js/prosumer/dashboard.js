
/***************************************************************************
 * The dashboard script is responsible for updating information
 * in the prosumers dashbaord page.
 ***************************************************************************/


var dashboardInterval;


$(function() {
    setBatteryValue(0.0);
    updateDashboard();
    connectDashboard();
});


/**
 * Connect the dashboard to the simulator
 */
function connectDashboard() {
    dashboardInterval = setInterval(updateDashboard, 1000);
}


/**
 * Disconnects the dashboard on unload
 */
function disconnectDashboard() {
    if (dashboardInterval != undefined) {
        clearInterval(dashboardInterval);
        dashboardInterval = undefined;
    }    
}


/**
 * Update the dashboard with new data from simulator.
 */
async function updateDashboard() {
    await updateHouse();
    await updatePrice();
}


/**
 * Update the house data e.g. wind turbine, battery etc.
 */
async function updateHouse() {
    try {
        let res = await fetch('/prosumer/house', {method: 'POST'});
        let house = await res.json();
        updateTurbine(house.turbine);
        updateBattery(house.battery);
    } catch(err) {
        updateTurbine();
        updateBattery();
    }
}


function updateTurbine(turbine) {
    if (typeof turbine != 'undefined') {
        $('#turbineValue').html((turbine.value * 1000).toFixed(2));
        if (!turbine.broken) {
            setStatus('#turbineStatus', 'online');
        } else {
            setStatus('#turbineStatus', 'offline');
        }
    } else {
        $('#turbineValue').html('...');
        setStatus('#turbineStatus', 'offline');
    }
}


function updateBattery(battery) {
    if (typeof battery != 'undefined') {
        let value = battery.value/battery.capacity;
        $('#batteryValue').html((value * 100).toFixed(2));
        setBatteryValue(value);
        setStatus('#batteryStatus', 'online');
    } else {
        $('#batteryValue').html('...');
        setStatus('#batteryStatus', 'offline');
    }
}


async function updatePrice() {
    try {
        let res = await fetch('/prosumer/market/price', {method: 'POST'});
        let price = await res.json();
        if (typeof price != 'undefined') {
            $('#priceValue').html(price.toFixed(2));
        } else {
            $('#priceValue').html('...');
        }
    } catch(err) {
        
    }
}


function setStatus(selector, status) {
    switch (status) {
    case "online":
        $(selector + ' .status-icon').css({backgroundColor: '#00bc8c'});
        break;
    case "offline":
        $(selector + ' .status-icon').css({backgroundColor: '#999'});
        break;
    case "broken":
        $(selector + ' .status-icon').css({backgroundColor: '#E74C3C'});
        break;
    default:
        $(selector + ' .status-icon').css({backgroundColor: '#444'});
        break;
    }
    $(selector + ' .status-text').html(status);
}


function setBatteryValue(value) {
    $('#fillpartial feOffset').attr('dy', 1.0 - value);
}
