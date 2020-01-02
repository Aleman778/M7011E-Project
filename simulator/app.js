
/***************************************************************************
 * The main server entry point.
 ***************************************************************************/


var express = require('express');
var Simulator = require('./simulator');
var wind = require('./api/wind');
app = express();
port = process.env.PORT || 3000;


//Allows get requests from http://localhost:3100.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3100');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Adds support for input from POST requests
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Start the server
app.listen(port);

// Start the simulator
var simulator = new Simulator();
simulator.restore();
simulator.run(1000 * 10);
