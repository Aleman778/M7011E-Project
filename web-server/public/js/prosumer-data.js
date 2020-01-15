var exitedPage = false;


/**
 *  Defines the prosumer data chart and the variables needed.
 */
var prosumerChartData = {};
prosumerChartData.maxPoints = 12;
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
    }, options: {
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: true,
                    color: '#444444'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Timestamp',
                    color: '#ffffff'
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    display: true,
                    color: '#444444'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Energy (Wh)',
                    color: '#ffffff'
                }
            }]
        }
    }
});


/**
 *  Defines the prosumer buffer chart and the variables needed.
 */
var bufferChartData = {};
bufferChartData.maxPoints = 12;
bufferChartData.labels = [];
bufferChartData.value = [];
bufferChartData.bufferMax = [];
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
            label: 'Buffer storage',
            data: bufferChartData.value,
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1,
            fill: true
        }]
    },options: {
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: true,
                    color: '#444444'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Timestamp',
                    color: '#ffffff'
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    display: true,
                    color: '#444444'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Price (kr/kWh)',
                    color: '#ffffff'
                }
            }]
        }
    }
});


initProsumerData();


/**
 * Updates the current prousmer data every 100 milliseconds.
 */
var prosumerInterval = setInterval(async function() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/${prosumerId}`);
    const prosumerData = await response.json();

    document.getElementById("prosumer_consumption").innerHTML = "Consumption: " +
        prosumerData.consumption.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_production").innerHTML = "Production: " +
        prosumerData.production.toFixed(3) + " " + prosumerData.unit;
    document.getElementById("prosumer_net_consumption").innerHTML = "Net Consumption: " +
        (prosumerData.netConsumption).toFixed(3) + " " + prosumerData.unit;

    document.getElementById("buffer").innerHTML = "Stored: " +
        (prosumerData.buffer.value).toFixed(3) + " " + prosumerData.unit;
    document.getElementById("bufferMax").innerHTML = "Max: " +
        (prosumerData.buffer.max) + " " + prosumerData.unit;
    document.getElementById("bufferExcessive").innerHTML = "Excessive Ratio: " +
        (prosumerData.buffer.excessiveProductionRatio * 100).toFixed(1) + " %" ;
    document.getElementById("bufferUnder").innerHTML = "Under Ratio: " +
        (prosumerData.buffer.underProductionRatio * 100).toFixed(1) + " %" ;

}, 100);


async function initProsumerData() {
    // await registerProsumerInSim();
    await initProsumerChartData();
    setUpdateProsumerChartTimeout();
}

async function registerProsumerInSim() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/register`, {
        method: 'POST', 
        body: JSON.stringify({id: prosumerId}),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
    });
} 

/**
 * Adds a value to the prosumer chart.
 */
async function addValueToProsumerChart(prosumerData) {
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
    if (bufferChartData.labels.length > bufferChartData.maxPoints) {
        bufferChartData.labels.shift();
        bufferChartData.value.shift();
        bufferChartData.bufferMax.shift();
    }
    bufferChartData.chart.update();
}


/**
 * Loads in the latest historical prosumer data to the prosumer chart.
 */
async function initProsumerChartData() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/history/latest/${prosumerId}`);
    const prosumerData = await response.json();
    for (var i = 0; i < prosumerData.data.length; i++) {
        addValueToProsumerChart(prosumerData.data[i]);
    }
}


/**
 * Updates the prosumer chart.
 */
async function updateProsumerChart() {
    const response = await fetch(`http://localhost:3000/simulator/prosumer/${prosumerId}`);
    const prosumerData = await response.json();
    addValueToProsumerChart(prosumerData);
    if (!exitedPage) {
        setUpdateProsumerChartTimeout();
    }
}


/**
 * Sets timeout for updateProsumerChart function, so it is called every ten minutes.
 */
async function setUpdateProsumerChartTimeout() {
    var futureDate = new Date();
    futureDate.setMilliseconds(0)
    futureDate.setSeconds(0);
    futureDate.setMinutes(futureDate.getMinutes() - futureDate.getMinutes()%10 + 10);
    setTimeout(updateProsumerChart, futureDate.getTime() - (new Date()).getTime());
}


/**
 * Sets the buffer settings in the simulator.
 */
async function setBufferSettings() {
    const max = $("bufferMaxInput").val(); 
    const excessiveProductionRatio = $("bufferExcessiveInput").val()/100;
    const underProductionRatio = $("bufferUnderInput").val()/100;
    const response = $.post('http://localhost:3100/prosumer/',
        method: 'POST',
        data: {
            excessiveProdutionRatio
        }
    );
    const data = await response.json();
}

/**
 * Clears the intervals when user leaves the page.
 */
window.onunload = function () {
    clearInterval(prosumerInterval);
    exitedPage = true;
}
