/**
 *  Defines the electricity price chart and the variables needed.
 */
var electricityPriceChartData = {};
electricityPriceChartData.maxPoints = 30;
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


var priceChartInterval = setInterval(async function() {
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
}, 2000);


var priceInterval = setInterval(async function() {
    const response = await fetch('http://localhost:3000/simulator/electricity/price');
    const priceData = await response.json();
    document.getElementById("electricity_price").innerHTML = priceData.electricity_price.toFixed(3) + " " + priceData.unit;
}, 100);


window.onbeforeunload = confirmExit;
function confirmExit(){
    clearInterval(priceChartInterval);
    clearInterval(priceInterval);
    return false;
}

