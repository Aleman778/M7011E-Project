/******************************************************************************
 * Creates a modeled price chart.
 ******************************************************************************/


let electricityPriceChartData = {};
let modelledPriceChartInterval;


/**
 * Creates a chart and starts an interval that updates it.
 * Note: Call this when page is loaded.
 */
function loadModelledPriceChart() {
    unloadModelledPriceChart();
    initModelledPriceChart();
    modelledPriceChartInterval = setInterval(updateModelledPriceChart, 2000);
}


/**
 * Clears the interval that updates the modelled price chart.
 * Note: Call this when page is unloaded.
 */
function unloadModelledPriceChart() {
    if (modelledPriceChartInterval != undefined) {
        clearInterval(modelledPriceChartInterval);
        modelledPriceChartInterval = undefined;
    }
}


/**
 * Updates the modelled price chart.
 */
async function updateModelledPriceChart() {
    try {
        /**
         * @TODO add a fetch for getting the modelled price.
         */
        const priceData = await response.json();
        const date = new Date(priceData.time);
        const time = date.getMinutes() + ":" + date.getSeconds();

        electricityPriceChartData.labels.push(time);
        electricityPriceChartData.value.push(priceData.electricity_price);
        if (electricityPriceChartData.labels.length > electricityPriceChartData.maxPoints) {
            electricityPriceChartData.labels.shift();
            electricityPriceChartData.value.shift();
        }
        electricityPriceChartData.chart.update();
    } catch(error) {
        console.error(error);
        unloadModelledPriceChart();
        /**
         * @TODO Add an alert.
         */
    }
    
}


/**
 * Initializes the modelled price chart.
 */
function initModelledPriceChart() {
    electricityPriceChartData.maxPoints = 30;
    electricityPriceChartData.labels = [];
    electricityPriceChartData.value = [];
    electricityPriceChartData.chart = new Chart(document.getElementById('modelledPricesChart').getContext('2d'), {
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
                        labelString: 'Price (kr/kWh)',
                        color: '#ffffff'
                    }
                }]
            }
        }
    });
}
