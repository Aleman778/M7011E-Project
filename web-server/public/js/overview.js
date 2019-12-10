
async function setBufferSettings() {
    const max = document.getElementById("bufferMaxInput").value; 
    const limit = document.getElementById("bufferLimitInput").value;
    const id = 0;
    const response = await fetch('http://localhost:3000/simulator/prosumer/' + id + '/max/' + max + '/limit/' + limit);
    const data = await response.json();
}


var maxPoints = 30;
var maxCount = 20;

/**
 *  Adds new label and value to chart.
 */
async function addData(chartData, newLabel, newData) {
    chartData.labels.push(newLabel);
    chartData.value.push(newData);
    if (chartData.labels.length > chartData.maxPoints) {
        chartData.labels.shift();
        chartData.value.shift();
    }
    chartData.chart.update();
}


/**
 *  Defines the wind speed chart and the variables needed.
 */
var windSpeedChartData = {};
windSpeedChartData.maxPoints = maxPoints;
windSpeedChartData.counterMax = maxCount;
windSpeedChartData.counter = windSpeedChartData.counterMax;
windSpeedChartData.labels = [];
windSpeedChartData.value = [];
windSpeedChartData.chart = new Chart(document.getElementById('windSpeedChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: windSpeedChartData.labels ,
        datasets: [{
            label: 'Wind Speed',
            data: windSpeedChartData.value,
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderColor: 'rgba(0, 0, 255, 1)',
            borderWidth: 1
        }]
    }
});


/**
 *  Retrieves the wind speed and updates the wind chart and value.
 */
getWindSpeed = async function() {
    const response = await fetch('http://localhost:3000/simulator/wind');
    const windData = await response.json();
    const date = new Date(windData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();

    document.getElementById("wind_speed").innerHTML = windData.wind_speed.toFixed(3) + " " + windData.unit;
    if (windSpeedChartData.counter >= windSpeedChartData.counterMax) {
        addData(windSpeedChartData, time, windData.wind_speed);
        windSpeedChartData.counter = 0;
    } else {
        windSpeedChartData.counter += 1;
    }
}


/**
 *  Defines the prosumer data chart and the variables needed.
 */
var prosumerChartData = {};
prosumerChartData.maxPoints = maxPoints * 2;
prosumerChartData.counterMax = maxCount;
prosumerChartData.counter = prosumerChartData.counterMax;
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
 *  Defines the prosumer data chart and the variables needed.
 */
var bufferChartData = {};
bufferChartData.maxPoints = maxPoints * 2;
bufferChartData.counterMax = maxCount;
bufferChartData.counter = bufferChartData.counterMax;
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
 *  Retrieves the prosumer data and updates the prosumer chart and values.
 */
getProsumerData = async function(id) {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/${id}`);
    const prosumerData = await response.json();
    prosumerData.net = prosumerData.netConsumption;
    const date = new Date(prosumerData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();

    document.getElementById("prosumer_consumption").innerHTML = "Consumption: " +
        prosumerData.consumption.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_production").innerHTML = "Production: " +
        prosumerData.production.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_net_consumption").innerHTML = "Net Consumption: " +
        (prosumerData.net).toFixed(3) + " " + prosumerData.unit;

    if (prosumerChartData.counter >= prosumerChartData.counterMax) {
        prosumerChartData.consumption.push(prosumerData.consumption);
        prosumerChartData.production.push(prosumerData.production);
        if (prosumerChartData.consumption.length > prosumerChartData.maxPoints) {
            prosumerChartData.consumption.shift();
            prosumerChartData.production.shift();
        }
        addData(prosumerChartData, time, prosumerData.net);
        prosumerChartData.counter = 0;
    } else {
        prosumerChartData.counter += 1;
    }

    document.getElementById("buffer").innerHTML = "Buffer: " +
        (prosumerData.buffer.value).toFixed(3) + " " + prosumerData.unit;
    document.getElementById("bufferMax").innerHTML = "Buffer Max: " +
        (prosumerData.buffer.max) + " " + prosumerData.unit;
    document.getElementById("bufferLimit").innerHTML = "Buffer Limit: " +
        (prosumerData.buffer.storingLimit * 100).toFixed(1) + " %" ;

    if (bufferChartData.counter >= bufferChartData.counterMax) {
        bufferChartData.bufferMax.push(prosumerData.buffer.max);
        bufferChartData.bufferStoreLimit.push(prosumerData.buffer.storingLimit * prosumerData.buffer.max);
        if (bufferChartData.bufferMax.length > bufferChartData.maxPoints) {
            bufferChartData.bufferMax.shift();
            bufferChartData.bufferStoreLimit.shift();
        }
        addData(bufferChartData, time, prosumerData.buffer.value);
        bufferChartData.counter = 0;
    } else {
        bufferChartData.counter += 1;
    }
}


/**
 *  Defines the electricity price chart and the variables needed.
 */
var electricityPriceChartData = {};
electricityPriceChartData.maxPoints = maxPoints;
electricityPriceChartData.counterMax = maxCount;
electricityPriceChartData.counter = electricityPriceChartData.counterMax;
electricityPriceChartData.labels = [];
electricityPriceChartData.value = [];
electricityPriceChartData.chart = new Chart(document.getElementById('electricityPricesChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: electricityPriceChartData.labels,
        datasets: [{
            label: 'Electricity Price',
            data: electricityPriceChartData.value,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1
        }]
    }
});


/**
 *  Retrieves the electricity price and updates the price chart and value.
 */
getElectricityPrice = async function() {
    const response = await fetch('http://localhost:3000/simulator/electricity/price');
    const priceData = await response.json();
    const date = new Date(priceData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();
    
    document.getElementById("electricity_price").innerHTML = priceData.electricity_price.toFixed(3) + " " + priceData.unit;
    if (electricityPriceChartData.counter >= electricityPriceChartData.counterMax) {
        addData(electricityPriceChartData, time, priceData.electricity_price);
        electricityPriceChartData.counter = 0;
    } else {
        electricityPriceChartData.counter += 1;
    }
}


/**
 *  Calls functions that update the values on screen at a frequency of 0.1 Hz
 */
setInterval(async function() {
    getWindSpeed();
    getProsumerData(0); // Need to get the signed in prosumers id and use that instead of 0.
    getElectricityPrice();
}, 100);
