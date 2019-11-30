
/***************************************************************************
 * The simulator instance keeps track of the model 
 ***************************************************************************/


var WindSim = require('./windsim.js');
var ProsumerSim = require('./prosumer-sim.js');
var electricity = require('./calculateElectricityPrice.js');


/**
 * Simulator instance model.
 */
class Simulator {
    /**
     * Creates a new simulator model.
     */
    constructor() {
        var max = Math.random() * 20 + 5;
        var stdev = Math.random() * 10 + 1;
        this.wind = new WindSim(max, stdev, "m/s");
        this.prosumers = [];
    }


    /**
     * Returns the current wind speed for this hour.
     */
    getCurrentWindSpeed() {
        let date = new Date();
        let wind_spd = this.wind.getWindSpeed(date);
        return {
            wind_speed: wind_spd,
            unit: this.wind.unit,
            hour: date.getHours(),
        };
    }

    
    /**
     * Returns the electricity production and consumption
     */
    getProsumerData(id) {
        var date = new Date();
        if (id >= 0 && id < this.prosumers.length) {
            let prosumer = this.prosumers[id];
            return {
                consumption: prosumer.getElectricityConsumption(date.getHours()),
                production: prosumer.getElectricityProduction(date),
                unit: prosumer.unit,
                hour: date.getHours(),
            };
        } else {
            return {
                status: 400,
                message: "requested prosumer with id " + id + " does not exist",
            };
        }
    }


    /**
     * Creates a new prosumer and returns the id.
     */
    createProsumer() {
        var p_scl = Math.random() * 0.3 + 0.05;
        var c_max = Math.random() * 2 + 2;
        var c_stdev = Math.random();
        var p_bdf = Math.round((Math.random() * 19)) + 1;
        var prosumer = new ProsumerSim(this.wind, p_scl, c_max, c_stdev, p_bdf, "Wh");
        var id = this.prosumers.length;
        this.prosumers.push(prosumer);
        return {id: id};
    }


    /**
     * Get the current electricity price.
     */
    getElectricityPrice() {
        var date = new Date();
        var wind_speed = this.wind.getWindSpeed(date);
        var demand = this.calculateDemand();
        var price = electricity.calculateElectricityPrice(demand, wind_speed);
        return {
            electricity_price: price/100,
            unit: "kr/kWh",
            hour: date.getHours(),
        };
    }


    /**
     * Gets the electricity demand, which is equal to the total amount of electricity consumed.
     */
    calculateDemand() {
        var date = new Date();
        var demand = 0;
        for (var i = 0; i < this.prosumers.length; i++) {
            demand += this.prosumers[i].getElectricityConsumption(date.getHours());
            demand -= this.prosumers[i].getElectricityProduction(date);
        }
        return demand;
    }


    dumpSimulationData() {
        // Wind speeds every hour
        var wind_data = []
        var date = new Date();
        for (var i = 0; i < 24; i++) {
            date.setHours(i);
            let wind_spd = this.wind.getWindSpeed(date);
            wind_data.push(wind_spd.toFixed(1) + " " + this.wind.unit);
        }

        // Prosumer data every hour
        var prosumers = []
        for (var i = 0; i < this.prosumers.length; i++) {
            date.setHours(i);
            let prosumer = this.prosumers[i];
            let prosumer_data = [];
            for (var i = 0; i < 24; i++) {
                let consumption = prosumer.getElectricityConsumption(i);
                let production = prosumer.getElectricityProduction(date);
                prosumer_data.push({
                    consumption: consumption.toFixed(2) + " " + prosumer.unit,
                    production: production.toFixed(2) + " " + prosumer.unit,
                    demand: (consumption - production).toFixed(2) + " " + prosumer.unit,
                });
            }
            prosumers.push({
                prosumer_params: {
                    produce_scalar: prosumer.productScalar,
                    consume_max: prosumer.comsumeMax,
                    consume_stdev: prosumer.consumeStdev,
                    turbine_breakdown_freq: prosumer.breakDownFreq,
                },
                prosumer_data: prosumer_data,
            });
        }

        // Electricity price every hour
        var electricity_prices = [];
        for (var i = 0; i < 24; i++) {
            date.setHours(i);
            let wind_speed = this.wind.getWindSpeed(date);
            var demand = 0;
            for (var j = 0; j < this.prosumers.length; j++) {
                demand += this.prosumers[j].getElectricityConsumption(i);
                demand -= this.prosumers[j].getElectricityProduction(date);
            }
            var price = electricity.calculateElectricityPrice(demand, wind_speed)/100;
            electricity_prices.push({
                demand: demand + " Wh",
                price: price.toFixed(2) + " kr/kWh",
            });
        }
        return {
            electricity_prices: electricity_prices,
            windsim_params: {
                wind_max: this.wind.max,
                wind_stdev: this.wind.standardDeviation,
            },
            wind_data: wind_data,
            prosumers: prosumers,
        };
    }
}


module.exports = new Simulator();
