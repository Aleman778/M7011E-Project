/**
 *  Defines the wind speed chart and the variables needed.
 */
var windSpeedChartData = {};
windSpeedChartData.maxPoints = 30;
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


setInterval(async function() {
    const response = await fetch('http://localhost:3000/simulator/wind');
    const windData = await response.json();
    const date = new Date(windData.time);
    const time = date.getMinutes() + ":" + date.getSeconds();
  
    windSpeedChartData.labels.push(time);
    windSpeedChartData.value.push(windData.wind_speed);
    if (windSpeedChartData.labels.length > windSpeedChartData.maxPoints) {
        windSpeedChartData.labels.shift();
        windSpeedChartData.value.shift();
    }
    windSpeedChartData.chart.update();
}, 2000);


setInterval(async function() {
    const response = await fetch('http://localhost:3000/simulator/wind');
    const windData = await response.json();
    document.getElementById("wind_speed").innerHTML = windData.wind_speed.toFixed(3) + " " + windData.unit;
}, 100);
