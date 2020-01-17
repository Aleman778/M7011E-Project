
/******************************************************************************
 * Creates a price chart.
 ******************************************************************************/


let priceChartData = {};
let priceChartInterval;


$(function() {
    if (role == 'prosumer' || role == 'manager') {
        if (priceChartInterval != undefined) {
            clearInterval(priceChartInterval);
            priceChartInterval = undefined;
        }
        initPriceChart();
        updatePriceChart();
        priceChartInterval = setInterval(updatePriceChart, 2000);
    } else {
        console.log("Error: Var role must be set.");
    }
});


$(window).on("unload", function() {
    if (priceChartInterval != undefined) {
        clearInterval(priceChartInterval);
        priceChartInterval = undefined;
    }
});



/**
 * Updates the modelled price chart.
 */
async function updatePriceChart() {
    try {
        const response = await fetch('/' + role + '/market/price', {
            method: 'POST'
        });
        const price = await response.json();

        if (price == undefined) {
            return;
        }

        const date = new Date();
        const time = date.getMinutes() + ":" + date.getSeconds();

        priceChartData.labels.push(time);
        priceChartData.value.push(price.toFixed(2));
        if (priceChartData.labels.length > priceChartData.maxPoints) {
            priceChartData.labels.shift();
            priceChartData.value.shift();
        }
        priceChartData.chart.update();
    } catch(error) {
        /**
         * @TODO Add an alert.
         */
    }   
}


/**
 * Initializes the modelled price chart.
 */
function initPriceChart() {
    priceChartData.maxPoints = 30;
    priceChartData.labels = [];
    priceChartData.value = [];
    priceChartData.chart = new Chart(document.getElementById('priceChart'), {
        type: 'line',
        data: {
            labels: priceChartData.labels,
            datasets: [{
                label: 'Electricity Price',
                data: priceChartData.value,
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
                        labelString: 'Price (öre/kWh)',
                        color: '#ffffff'
                    }
                }]
            }
        }
    });
}
