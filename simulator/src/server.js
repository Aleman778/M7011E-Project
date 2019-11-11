const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
const WindSim = require("./windsim.js");
const ProsumerSim = require("./prosumer-sim.js");

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    var windsim = new WindSim(10, 5);
    var prosumer = new ProsumerSim(windsim, 0.5, 6, 3);

    // Debug printing
    var out = "";
    for (var i = 0; i < 24; i++) {
        out += "Time: " + (i < 10 ? "0" : "") + i + ":00" + "\n";
        out += "\tWind: " + windsim.getWindSpeed(i) + " ms\n";
        out += "\tElectricity Consumption: " + prosumer.getElectricityConsumption(i) + " kWh\n";
        out += "\tElectricity Production: " + prosumer.getElectricityProduction(i) + " kWh\n";
    }
    res.end(out);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
