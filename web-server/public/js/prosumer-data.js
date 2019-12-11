/**
 * Sets the buffer settings in the simulator.
 */
async function setBufferSettings() {
    const max = document.getElementById("bufferMaxInput").value; 
    const limit = document.getElementById("bufferLimitInput").value/100;
    const response = await fetch('http://localhost:3000/simulator/prosumer/' + id + '/max/' + max + '/limit/' + limit);
    const data = await response.json();
}


/**
 *  Defines the prosumer data chart and the variables needed.
 */
var prosumerChartData = {};
prosumerChartData.maxPoints = 60;
prosumerChartData.labels = [];
prosumerChartData.value = [];
prosumerChartData.consumption = [];
prosumerChartData.production = [];
prosumerChartData.chart = new Chart(document.getElementById('prosumerChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: prosumerChartData.labels,
        datasets: [{
            label: 'Net Electricity Consumption',
            data: prosumerChartData.value,
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderColor: 'rgba(0, 0, 255, 1)',
            borderWidth: 1,
            fill: false
        }, {
            label: 'Electricity consumption',
            data: prosumerChartData.consumption,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1,
            fill: false
        }, {
            label: 'Electricity production',
            data: prosumerChartData.production,
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1,
            fill: false
        }]
    }
});


/**
 *  Defines the prosumer buffer chart and the variables needed.
 */
var bufferChartData = {};
bufferChartData.maxPoints = 30;
bufferChartData.labels = [];
bufferChartData.value = [];
bufferChartData.bufferMax = [];
bufferChartData.bufferStoreLimit = [];
bufferChartData.chart = new Chart(document.getElementById('bufferChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: bufferChartData.labels,
        datasets: [{
            label: 'Buffer Max Storage',
            data: bufferChartData.bufferMax,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1,
            fill: false
        }, {
            label: 'Buffer Storage Limit',
            data: bufferChartData.bufferStoreLimit,
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderColor: 'rgba(0, 0, 255, 1)',
            borderWidth: 1,
            fill: false
        }, {
            label: 'Buffer storage',
            data: bufferChartData.value,
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1,
            fill: true
        }]
    }
});


/**
 * Updates the prosumer data charts every 2 seconds.
 */
var prosumerChartInterval = setInterval(async function() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/${id}`);
    const prosumerData = await response.json();
    const date = new Date(prosumerData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();

    prosumerChartData.labels.push(time);
    prosumerChartData.value.push(prosumerData.netConsumption);
    prosumerChartData.consumption.push(prosumerData.consumption);
    prosumerChartData.production.push(prosumerData.production);
    if (prosumerChartData.labels.length > prosumerChartData.maxPoints) {
        prosumerChartData.labels.shift();
        prosumerChartData.value.shift();
        prosumerChartData.consumption.shift();
        prosumerChartData.production.shift();
    }
    prosumerChartData.chart.update();

    bufferChartData.labels.push(time);
    bufferChartData.value.push(prosumerData.buffer.value);
    bufferChartData.bufferMax.push(prosumerData.buffer.max);
    bufferChartData.bufferStoreLimit.push(prosumerData.buffer.storingLimit * prosumerData.buffer.max);
    if (bufferChartData.labels.length > bufferChartData.maxPoints) {
        bufferChartData.labels.shift();
        bufferChartData.value.shift();
        bufferChartData.bufferMax.shift();
        bufferChartData.bufferStoreLimit.shift();
    }
    bufferChartData.chart.update();
}, 2000);


/**
 * Updates the current prousmer data every 100 milliseconds.
 */
var prosumerInterval = setInterval(async function() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/${id}`);
    const prosumerData = await response.json();

    document.getElementById("prosumer_consumption").innerHTML = "Consumption: " +
        prosumerData.consumption.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_production").innerHTML = "Production: " +
        prosumerData.production.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_net_consumption").innerHTML = "Net Consumption: " +
        (prosumerData.netConsumption).toFixed(3) + " " + prosumerData.unit;

    document.getElementById("buffer").innerHTML = "Buffer: " +
        (prosumerData.buffer.value).toFixed(3) + " " + prosumerData.unit;
    document.getElementById("bufferMax").innerHTML = "Buffer Max: " +
        (prosumerData.buffer.max) + " " + prosumerData.unit;
    document.getElementById("bufferLimit").innerHTML = "Buffer Limit: " +
        (prosumerData.buffer.storingLimit * 100).toFixed(1) + " %" ;

}, 100);


/**
 * Clears the intervals when user leaves the page.
 */
window.onbeforeunload = confirmExit;
function confirmExit(){
    clearInterval(prosumerChartInterval);
    clearInterval(prosumerInterval);
    return false;
}
