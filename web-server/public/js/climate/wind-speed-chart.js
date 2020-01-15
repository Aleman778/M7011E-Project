let windSpeedTimeout;
var windSpeedChart = {};


/**
 * Creates a wind speed charts and sets timeout so the chart is updated.
 * Note: Call this when page is loaded.
 */
async function loadWindSpeedChart() {
    initWindSpeedChart();
    let initSuccess = await initWindChartData();
    if (initSuccess) {
        setUpdateWindChartTimeout();
    }
}

/**
 * Clears the timeout that updates the wind speed chart.
 * Note: Call this when page is unloaded.
 */
function unloadWindSpeedChart() {
    if (windSpeedTimeout != undefined) {
        clearTimeout(windSpeedTimeout);
        windSpeedTimeout = undefined;
    }
}


/**
 * Adds a value to the chart. 
 */
async function addValueToWindChart(windData) {
    windSpeedChart.labels.push((new Date(windData.time)).getHours());
    windSpeedChart.value.push(windData.value);
    if (windSpeedChart.labels.length > windSpeedChart.maxPoints) {
        windSpeedChart.labels.shift();
        windSpeedChart.value.shift();
    }
    windSpeedChart.chart.update();
}


/**
 *  Loads in the latest historical wind data into the wind chart.
 */
async function initWindChartData() {
    try {
        const response = await fetch('http://localhost:3000/api/wind/history/all');
        const windData = await response.json();
        for (var i = Math.max(0, windData.length - 12); i < windData.length; i++) {
            addValueToWindChart(windData[i]);
        }
        return true;
    } catch(error) {
        console.log(error);
        unloadWindSpeedChart();
        /**
         * @TODO Add a alert.
         */
        return false;
    }
}


/**
 * Updates the wind speed chart with the latest data.
 */
async function updateWindChart() {
    try {
        const response = await fetch('http://localhost:3000/api/wind');
        const windData = await response.json();
        addValueToWindChart(windData);
        setUpdateWindChartTimeout();
    } catch(error) {
        console.error(error);
        unloadWindSpeedChart();
        /**
         * @TODO Add a alert.
         */
    }
}


/**
 * Sets timeout for updateWindChart function, so it is called every ten minutes.
 */
async function setUpdateWindChartTimeout() {
    var futureDate = new Date();
    futureDate.setMilliseconds(0)
    futureDate.setSeconds(0);
    futureDate.setMinutes(futureDate.getMinutes() - futureDate.getMinutes()%10 + 10);
    windSpeedTimeout = setTimeout(updateWindChart, futureDate.getTime() - (new Date()).getTime());
}


/**
 * Initializes the wind speed chart.
 */
function initWindSpeedChart() {
    windSpeedChart.maxPoints = 12;
    windSpeedChart.labels = [];
    windSpeedChart.value = [];
    windSpeedChart.chart = new Chart(document.getElementById('windSpeedChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: windSpeedChart.labels ,
            datasets: [{
                label: 'Wind Speed',
                data: windSpeedChart.value,
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                borderColor: 'rgba(0, 0, 255, 1)',
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
                        labelString: 'Hour (h)',
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
                        labelString: 'Wind Speed (m/s)',
                        color: '#ffffff'
                    }
                }]
            }
        }
    });
}
