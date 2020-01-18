
/***************************************************************************
 * The dashboard script is responsible for updating information
 * in the prosumers dashbaord page.
 ***************************************************************************/


var dashboardInterval;


$(function() {
    setBatteryValue(0.0);
    updateDashboard();
    connectDashboard();

    $(document).on('input', '#consumeRatioInput', function() {
        $('#consumeRatioValue').html($('#consumeRatioInput').val() + '%');
    });
    
    $(document).on('input', '#chargeRatioInput', function() {
        $('#chargeRatioValue').html($('#chargeRatioInput').val() + '%');
    });

    $('[data-toggle="tooltip"]').tooltip()
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
    await updateWindSpeed();
}


/**
 * Update the house data e.g. wind turbine, battery etc.
 */
async function updateHouse() {
    try {
        let res = await fetch('/prosumer/house', {method: 'POST'});
        let house = await res.json();

        let unit = " kWh";
        let consumption = house.consumption;
        let production = house.turbine.value || 0;
        let netProduction = production - consumption;
        
        $("#consumptionTD").html((consumption).toFixed(3) + unit);
        $("#productionTD").html((production).toFixed(3) + unit);
        $("#netProductionTD").html((netProduction).toFixed(3) + unit);
        if (house.blockTimer > 0) {
            $("#blockTimerTD").html('For ' + (house.blockTimer / 1000) + ' seconds');
        } else {
            $("#blockTimerTD").html('No');
        }
        $("#blackoutTD").html(house.blackOut ? 'Yes' : 'No');
        $("#chargeRatioTD").html((house.chargeRatio * 100).toFixed(0) + "%");
        $("#consumeRatioTD").html((house.consumeRatio * 100).toFixed(0) + "%");
        $("#batteryCapacityTD").html(house.battery.capacity + unit);
        $("#batteryValueTD").html(house.battery.value + unit);
        $("#consumeRatioTD").html((house.consumeRatio * 100).toFixed(0) + "%");
        $("#powerplantTD").html(house.powerPlant.name || 'Not connected');
        
        updateTurbine(house.turbine, house.repairTime);
        updateBattery(house.battery);
    } catch(err) {
        console.trace(err);
        updateTurbine();
        updateBattery();
    }
}


/**
 * Update the wind turbine 
 */
function updateTurbine(turbine, repairTime) {
    if (typeof turbine != 'undefined') {
        $('#turbineValue').html((turbine.value * 1000).toFixed(2));
        if (!turbine.broken) {
            setStatus('#turbineStatus', 'online');
        } else {
            setStatus('#turbineStatus', 'broken');
        }
    } else {
        $('#turbineValue').html('...');
        setStatus('#turbineStatus', 'offline');
    }
}


/**
 * Update the battery status.
 */
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


/**
 * Update the current market price.
 */
async function updatePrice() {
    try {
        let res = await fetch('/prosumer/market/price', {method: 'POST'});
        let price = parseFloat(await res.json());
        if (typeof price != 'undefined') {
            $("#marketPriceTD").html(price.toFixed(2) + 'kr per kWh');
            $('#priceValue').html(price.toFixed(2));
            setStatus('#powerplantStatus', 'online');
        } else {
            $('#priceValue').html('...');
            setStatus('#powerplantStatus', 'offline');
        }
    } catch(err) {
        $('#priceValue').html('...');
        setStatus('#powerplantStatus', 'offline');
    }
}


/**
 * Update the current wind speed.
 */
async function updateWindSpeed() {
    try {
        let res = await fetch('/prosumer/climate/wind');
        let speed = await res.json();
        if (typeof speed != 'undefined') {
            $('#windValue').html(speed.value.toFixed(2));
            setStatus('#windStatus', 'online');
        } else {
            $('#windValue').html('...');
            setStatus('#windStatus', 'offline');
        }
    } catch(err) {
        $('#windValue').html('...');
        setStatus('#windStatus', 'offline');
    }
}


/**
 * Set the current status of a specified status group.
 */
function setStatus(selector, status) {
    switch (status) {
    case "online":
        $(selector + ' .status-icon').css({backgroundColor: '#00bc8c'});
        break;
    case "offline":
        $(selector + ' .status-icon').css({backgroundColor: '#999'});
        break;
    default:
        $(selector + ' .status-icon').css({backgroundColor: '#E74C3C'});
        break;
    }
    $(selector + ' .status-text').html(status);
}


/**
 * Set the battery fill value.
 */
function setBatteryValue(value) {
    $('#fillpartial feOffset').attr('dy', 1.0 - value);
}
