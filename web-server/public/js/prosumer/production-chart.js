
/******************************************************************************
 * Creates a prosumer production chart and updates it.
 * Also Creates a prosumer buffer chart and updates it.
 ******************************************************************************/


let prosumerChart = {};
let batteryChart = {};

let productionInterval;


/**
 * Loads historical production data into chart and sets interval for updating 
 * production and buffer data when page is loaded.
 * Note: Call this when page is loaded.
 * @param {string} role the role of the user viewing the page.
 * @param {string} prosumerId the prosumers id, is only needed if the role is manager.
 */
async function loadProsumerChart(role, prosumerId) {
    if (productionInterval != undefined) {
        clearInterval(productionInterval);
        productionInterval = undefined;
    }
    initProsumerProductionChart();
    initProsumerBatteryChart();

    let productionQueryURL;
    let productionQueryBody;
    let historicalProductionQueryURL;
    switch(role) {
        case 'prosumer':
            productionQueryURL = '/prosumer/house';
            productionQueryBody = {};
            historicalProductionQueryURL = '/prosumer/house/history';
            break;
        case 'manager':
            productionQueryURL = '/manager/prosumer/house';
            productionQueryBody = {prosumerId: prosumerId};
            historicalProductionQueryURL = '/manager/prosumer/house/history';
            break;
        default:
            console.log("ERROR: Variable role not set.")
            return;
    }
    
    let initSuccess = await initProsumerChartData(historicalProductionQueryURL, productionQueryBody);
    if (initSuccess) {
        productionInterval = setInterval(updateProsumerChart, 1000 * 60 * 10, productionQueryURL, productionQueryBody);
    }
}


/**
 * Clears the interval that updates prosumer production chart.
 */
$(window).on("unload", function() {
    if (productionInterval != undefined) {
        clearInterval(productionInterval);
        productionInterval = undefined;
    }
});


/**
 * Adds a value to the prosumer chart.
 */
async function addValueToProsumerChart(productionData) {
    const date = new Date(productionData.time)
    const time =  date.getHours() + ":" + date.getMinutes();

    prosumerChart.labels.push(time);
    prosumerChart.netConsumption.push(productionData.net_consumption * 3600);
    prosumerChart.consumption.push(productionData.consumption * 3600);
    prosumerChart.production.push(productionData.production * 3600);
    if (prosumerChart.labels.length > prosumerChart.maxPoints) {
        prosumerChart.labels.shift();
        prosumerChart.netConsumption.shift();
        prosumerChart.consumption.shift();
        prosumerChart.production.shift();
    }
    prosumerChart.chart.update();

    batteryChart.labels.push(time);
    batteryChart.storage.push(productionData.battery_value * 3600);
    batteryChart.capacity.push(productionData.battery_capacity * 3600);
    if (batteryChart.labels.length > batteryChart.maxPoints) {
        batteryChart.labels.shift();
        batteryChart.storage.shift();
        batteryChart.capacity.shift();
    }
    batteryChart.chart.update();
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
        const data = await response.json();

        let production = data.turbine.currentPower || 0;
        let productionData = {
            time: (new Date()).getTime(),
            production: production,
            consumption: data.consumption,
            net_consumption: production - data.consumption,
            battery_capacity: data.battery._value,
            battery_value: data.battery.capacity,
        };

        addValueToProsumerChart(productionData);
    } catch(error) {
        console.error(error);
        if (productionInterval != undefined) {
            clearInterval(productionInterval);
            productionInterval = undefined;
        }
        /**
         * @TODO Add an alert.
         */
    }
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
        const productionData = await response.json();

        for (let i = Math.max(0, productionData.length - prosumerChart.maxPoints); i < productionData.length; i++) {
            addValueToProsumerChart(productionData[i]);
        }
        return true;
    } catch (error) {
        console.error(error);
        if (productionInterval != undefined) {
            clearInterval(productionInterval);
            productionInterval = undefined;
        }
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
    batteryChart.maxPoints = prosumerChart.maxPoints;
    batteryChart.labels = [];
    batteryChart.storage = [];
    batteryChart.capacity = [];
    batteryChart.chart = new Chart(document.getElementById('batteryChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: batteryChart.labels,
            datasets: [{
                label: 'Battery capacity',
                data: batteryChart.capacity,
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                steppedLine: true,
                fill: false
            }, {
                label: 'Battery storage',
                data: batteryChart.storage,
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
