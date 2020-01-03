var exitedPage = false;

var windSocket = new WebSocket("ws://localhost:8000");


/**
 * Updates the current wind speed data every time a message is received.
 */
windSocket.onmessage = function (event) {
    const windData = JSON.parse(event.data);
    document.getElementById("wind_speed").innerHTML = windData.wind_speed.toFixed(3) + " " + windData.unit;
}

/**
 *  Defines the wind speed chart and the variables needed.
 */
var windSpeedChartData = {};
windSpeedChartData.maxPoints = 12;
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
                    labelString: 'Wind Speed (m/s)',
                    color: '#ffffff'
                }
            }]
        }
    }
});

initWindChartData();
setUpdateWindChartTimeout();


/**
 * Adds a value to the chart. 
 */
async function addValueToWindChart(windData) {
    const date = new Date(windData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();
  
    windSpeedChartData.labels.push(time);
    windSpeedChartData.value.push(windData.wind_speed);
    if (windSpeedChartData.labels.length > windSpeedChartData.maxPoints) {
        windSpeedChartData.labels.shift();
        windSpeedChartData.value.shift();
    }
    windSpeedChartData.chart.update();
}


/**
 *  Loads in the latest historical wind data into the wind chart.
 */
async function initWindChartData() {
    const response = await fetch('http://localhost:3000/simulator/wind/history/latest');
    const windData = await response.json();
    for (var i = 0; i < windData.data.length; i++) {
        addValueToWindChart(windData.data[i]);
    }
}


/**
 * Updates the wind speed chart with the latest data.
 */
async function updateWindChart() {
    const response = await fetch('http://localhost:3000/simulator/wind');
    const windData = await response.json();
    addValueToWindChart(windData);
    if (!exitedPage) {
        setUpdateWindChartTimeout();
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
    setTimeout(updateWindChart, futureDate.getTime() - (new Date()).getTime());
}


/**
 * Clears the intervals when user leaves the page.
 */
window.onbeforeunload = confirmExit;
function confirmExit(){
    windSocket.close();
    exitedPage = true;
    return false;
}
