let windSpeedTimeout;
var windSpeedChart = {};


$(async function() {
    if (windSpeedTimeout != undefined) {
        clearTimeout(windSpeedTimeout);
        windSpeedTimeout = undefined;
    }
    initWindSpeedChart();
    let initSuccess = await initWindChartData();
    if (initSuccess) {
        setUpdateWindChartTimeout();
    }
});


$(window).on("unload", function() {
    if (windSpeedTimeout != undefined) {
        clearTimeout(windSpeedTimeout);
        windSpeedTimeout = undefined;
    }
});


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
        const response = await fetch('/prosumer/climate/wind/history');
        const windData = await response.json();
        for (var i = Math.max(0, windData.length - windSpeedChart.maxPoints); i < windData.length; i++) {
            addValueToWindChart(windData[i]);
        }
        return true;
    } catch(error) {
        console.log(error);
        if (windSpeedTimeout != undefined) {
            clearTimeout(windSpeedTimeout);
            windSpeedTimeout = undefined;
        }
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
        const response = await fetch('/prosumer/climate/wind');
        const windData = await response.json();
        addValueToWindChart(windData);
        setUpdateWindChartTimeout();
    } catch(error) {
        console.error(error);
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
