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
    initModelledPriceChart();
    modelledPriceChartInterval = setInterval(updateModelledPriceChart, 2000);
}


/**
 * Clears the interval that updates the modelled price chart.
 * Note: Call this when page is unloaded.
 */
function unloadModelledPriceChart() {
    clearInterval(modelledPriceChartInterval);
}


/**
 * Updates the modelled price chart.
 */
async function updateModelledPriceChart() {
    const response = await fetch('http://localhost:3000/simulator/electricity/price');
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
