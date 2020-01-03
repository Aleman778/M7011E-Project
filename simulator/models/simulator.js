
/***************************************************************************
 * The simulator instance keeps track of the model 
 ***************************************************************************/


var WindSim = require('./windsim.js');
var ProsumerSim = require('./prosumer-sim.js');
var electricity = require('./calculateElectricityPrice.js');
const webSocket = require('./websocket.js');
const electricityGridDB = require('./electricity-grid-queries.js');


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
        webSocket.setWindSim(this.wind);

        this.loadUsersFromDB();

        var date = new Date();
        date.setMilliseconds(0);
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(date.getHours() + 1);

        setTimeout(this.storeProsumersData.bind(this), date.getTime() - (new Date()).getTime());
    }


    /**
     * Loads all prosumer from database.
     */
    async loadUsersFromDB() {
        const allProsumerIDs = await electricityGridDB.getAllProsumerIDs();
        for (var p in allProsumerIDs) {
            this.createProsumer(allProsumerIDs[p].id);
        }
        this.storeProsumersData(); // TODO: Remove this line.
    }


    /**
     * Stores all the prosumers data in the database.
     */
    async storeProsumersData() {
        async function storeProsumerData(prosumer, date) {
            electricityGridDB.insertProsumerData(prosumer.getId(), date.getTime()/1000, await prosumer.simulateElectricityProduction(date),
                prosumer.simulateElectricityConsumption(date), prosumer.getBuffer());
        }

        var date = new Date();
        for (var p in this.prosumers) {
            storeProsumerData(this.prosumers[p], date);
        }
        date.setHours(date.getHours() + 1);
        setTimeout(this.storeProsumersData.bind(this), date.getTime() - (new Date()).getTime());
    }


    /**
     * Returns the wind speed at time date.
     */
    async getWindSpeed(date) {
        const wind_spe = await this.wind.getWindSpeed(date);
        return {
            time: new Date(date.getTime()),
            wind_speed: wind_spe,
            unit: this.wind.unit,
        };
    }

    
    /**
     * Returns the electricity production and consumption
     */
    async getProsumerData(id, date) {
        async function getPData(prosumers, pos, date) {
            let prosumer = prosumers[pos];
            const consumption = prosumer.getElectricityConsumption(date);
            const production = await prosumer.getElectricityProduction(date);
            return {
                consumption: consumption,
                production: production,
                netConsumption: prosumer.getNetConsumption(consumption, production),
                buffer: { ...prosumer.getBuffer() },
                unit: prosumer.unit,
                time: new Date(date.getTime()),
            };
        }

        for (var i = 0; i < this.prosumers.length; i++) {
            if (this.prosumers[i].getId() == id) {
                return getPData(this.prosumers, i, date);
            }
        }

        if (electricityGridDB.getProsumerExists(id)) {
            this.createProsumer(id);
            return getPData(this.prosumers, this.prosumers.length - 1, date);
        }

        return {
            status: 400,
            message: "requested prosumer with id " + id + " does not exist",
        };
    }


    /**
     * Creates a new prosumer and returns the id.
     */
    createProsumer(id) {
        for (var i = 0; i < this.prosumers.length; i++) {
            if (this.prosumers[i].getId() == id) {
                return {
                    status: 400,
                    message: "prosumer with id " + id + " does already exist",
                };
            }
        }
        var p_scl = Math.random() * 0.3 + 0.05;
        var c_max = Math.random() * 2 + 2;
        var c_stdev = Math.random();
        var p_bdf = Math.round((Math.random() * 19)) + 1;
        var prosumer = new ProsumerSim(id, this.wind, p_scl, c_max, c_stdev, p_bdf, "Wh", 1000);
        this.prosumers.push(prosumer);
        return {id: id};
    }


    /**
     * Sets the prosumers buffer settings.
     * @param id the id of the prosumer.
     * @param bufferMax the new max buffer value. Ops! If it is the same as the old max it will not be updated.
     * @param bufferExcessiveProductionRatio the ratio of electricity stored in buffer when there is excessive production. 
     * @param bufferUnderProductionRatio the ratio of electricity taken from buffer when there is under production. 
     */
    setProsumerBufferSettings(id, bufferMax, bufferExcessiveProductionRatio, bufferUnderProductionRatio) {
        for (var i = 0; i < this.prosumers.length; i++) {
            if (this.prosumers[i].getId() == id) {
                let prosumer = this.prosumers[i];
                let buffer = prosumer.getBuffer();
                if (buffer.max != bufferMax) {
                    prosumer.setBufferMax(bufferMax);
                }
                prosumer.setBufferExcessiveProductionRatio(bufferExcessiveProductionRatio);
                prosumer.setBufferUnderProductionRatio(bufferUnderProductionRatio);
                return {
                    buffer: prosumer.getBuffer()
                };
            }
        }

        return {
            status: 400,
            message: "requested prosumer with id " + id + " does not exist",
        };
    }


    /**
     * Get the current electricity price.
     */
    async getElectricityPrice() {
        var date = new Date();
        var wind_speed = await this.wind.getWindSpeed(date);
        var demand = await this.calculateDemand();
        var price = electricity.calculateElectricityPrice(demand/this.prosumers.length);
        return {
            electricity_price: price/100,
            unit: "kr/kWh",
            time: date,
        };
    }


    /**
     * Gets the electricity demand, which is equal to the total amount of electricity consumed.
     */
    async calculateDemand() {
        var date = new Date();
        var demand = 0;
        for (var i = 0; i < this.prosumers.length; i++) {
            demand += this.prosumers[i].getElectricityConsumption(date);
            demand -= await this.prosumers[i].getElectricityProduction(date);
        }
        return demand;
    }


    async dumpSimulationData() {
        // Wind speeds every hour
        var wind_data = []
        var date = new Date();
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        for (var i = 0; i < 24; i++) {
            date.setHours(i);
            let wind_spd = await this.wind.getWindSpeed(date);
            wind_data.push(wind_spd + " " + this.wind.unit);
        }

        // Prosumer data every hour
        var prosumers = []
        for (var i = 0; i < this.prosumers.length; i++) {
            let prosumer = this.prosumers[i];
            let prosumer_data = [];
            for (var i = 0; i < 24; i++) {
                date.setHours(i);
                let consumption = prosumer.getElectricityConsumption(date);
                let production = await prosumer.getElectricityProduction(date);
                let netConsumption = prosumer.getNetConsumption(consumption, production);
                prosumer_data.push({
                    consumption: consumption.toFixed(2) + " " + prosumer.unit,
                    production: production.toFixed(2) + " " + prosumer.unit,
                    netConsumption: netConsumption,
                    buffer: prosumer.getBuffer(),
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
            let wind_speed = await this.wind.getWindSpeed(date);
            var demand = 0;
            for (var j = 0; j < this.prosumers.length; j++) {
                demand += this.prosumers[j].getElectricityConsumption(date);
                demand -= await this.prosumers[j].getElectricityProduction(date);
            }
            var price = electricity.calculateElectricityPrice(demand/this.prosumers.length)/100;
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
