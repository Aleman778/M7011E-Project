
/******************************************************************************
 * Creates a prosumer production chart and updates it.
 * Also Creates a prosumer buffer chart and updates it.
 ******************************************************************************/


let prosumerChart = {};
let bufferChart = {};

let prosumerChartTimeout;


/**
 * Loads historical production data into chart and sets interval for updating 
 * production and buffer data when page is loaded.
 * Note: Call this when page is loaded.
 * @param {string} role the role of the user viewing the page.
 * @param {uuid.v4} prosumerIp the prosumers ip, is only needed if the role is manager.
 */
async function loadProsumerChart(role, prosumerIp) {
    unloadProsumerChart();
    initProsumerProductionChart();
    initProsumerBatteryChart();

    let productionQueryURL;
    let productionQueryBody;
    let historicalProductionQueryURL;
    switch(role) {
        case 'prosumer':
            productionQueryURL = '/prosumer/production/get';
            productionQueryBody = {};
            historicalProductionQueryURL = '/prosumer/production/history/latest/get';
            break;
        case 'manager':
            productionQueryURL = '/manager/prosumer/production/get';
            productionQueryBody = {prosumerId: prosumerIp};
            historicalProductionQueryURL = '/manager/prosumer/production/history/latest/get';
            break;
        default:
            console.log("ERROR: Variable role not set.")
            return;
    }
    
    /**
     * @TODO Add this line when there is a query for getting historical prosumer data.
     */
    // let initSuccess = await initProsumerChartData(historicalProductionQueryURL, productionQueryBody);
    // if (initSuccess) {
    //     setUpdateProsumerChartTimeout(productionQueryURL, productionQueryBody);
    // }
}


/**
 * Clears the timeout that updates prosumer production chart.
 * Note: Call this when page is unloaded.
 */
function unloadProsumerChart() {
    if (prosumerChartTimeout != undefined) {
        clearTimeout(prosumerChartTimeout);
        prosumerChartTimeout = undefined;
    }
}


/**
 * Adds a value to the prosumer chart.
 */
async function addValueToProsumerChart(prosumerData) {
    const date = new Date();
    const time = date.getMinutes() + ":" + date.getSeconds();

    prosumerChart.labels.push(time);
    /**
     * @TODO Add real value instead of 0 when query is fixed.
     */
    prosumerChart.netConsumption.push(0);
    prosumerChart.consumption.push(0);
    prosumerChart.production.push(prosumerData.turbine._currentPower);
    if (prosumerChart.labels.length > prosumerChart.maxPoints) {
        prosumerChart.labels.shift();
        prosumerChart.netConsumption.shift();
        prosumerChart.consumption.shift();
        prosumerChart.production.shift();
    }
    prosumerChart.chart.update();

    bufferChart.labels.push(time);
    bufferChart.storage.push(prosumerData.battery._value);
    bufferChart.bufferMax.push(prosumerData.battery._capacity);
    if (bufferChart.labels.length > bufferChart.maxPoints) {
        bufferChart.labels.shift();
        bufferChart.storage.shift();
        bufferChart.bufferMax.shift();
    }
    bufferChart.chart.update();
}


/**
 * Updates the prosumer chart.
 */
async function updateProsumerChart(productionQueryURL, productionQueryBody) {
    try {
        const response = await fetch(productionQueryURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productionQueryBody)
        });
        const prosumerData = await response.json();
        addValueToProsumerChart(prosumerData);
        setUpdateProsumerChartTimeout(productionQueryURL, productionQueryBody);
    } catch(error) {
        console.error(error);
        unloadProsumerChart();
        /**
         * @TODO Add an alert.
         */
    }
}


/**
 * Sets timeout for updateProsumerChart function, so it is called every ten minutes.
 */
async function setUpdateProsumerChartTimeout(productionQueryURL, productionQueryBody) {
    var futureDate = new Date();
    futureDate.setMilliseconds(0);
    futureDate.setSeconds(0);
    futureDate.setMinutes(futureDate.getMinutes() - futureDate.getMinutes()%10 + 10);
    prosumerChartTimeout = setTimeout(updateProsumerChart, futureDate.getTime() - (new Date()).getTime(), 
        productionQueryURL, productionQueryBody);
}


/**
 * Loads in the latest historical prosumer production data into the prosumer chart.
 */
async function initProsumerChartData(historicalProductionQueryURL, historicalProductionQueryBody) {
    try {
        const response = await fetch(historicalProductionQueryURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historicalProductionQueryBody)
        });
        const prosumerData = await response.json();
        for (var i = 0; i < prosumerData.data.length; i++) {
            addValueToProsumerChart(prosumerData.data[i]);
        }
        return true;
    } catch (error) {
        console.error(error);
        /**
         * @TODO Add an alert.
         */
        return false;
    }
}


/**
 * Initializes the prosumers production chart.
 */
function initProsumerProductionChart() {
    prosumerChart.maxPoints = 12;
    prosumerChart.labels = [];
    prosumerChart.netConsumption = [];
    prosumerChart.consumption = [];
    prosumerChart.production = [];
    prosumerChart.chart = new Chart(document.getElementById('prosumerChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: prosumerChart.labels,
            datasets: [{
                label: 'Net Electricity Consumption',
                data: prosumerChart.netConsumption,
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                borderColor: 'rgba(0, 0, 255, 1)',
                borderWidth: 1,
                fill: false
            }, {
                label: 'Electricity consumption',
                data: prosumerChart.consumption,
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                fill: false
            }, {
                label: 'Electricity production',
                data: prosumerChart.production,
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
}


/**
 * Initializes the prosumers battery chart.
 */
function initProsumerBatteryChart() {
    bufferChart.maxPoints = 12;
    bufferChart.labels = [];
    bufferChart.storage = [];
    bufferChart.bufferMax = [];
    bufferChart.chart = new Chart(document.getElementById('bufferChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: bufferChart.labels,
            datasets: [{
                label: 'Buffer Max Storage',
                data: bufferChart.bufferMax,
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                fill: false
            }, {
                label: 'Buffer storage',
                data: bufferChart.storage,
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
}
