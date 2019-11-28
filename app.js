
/***************************************************************************
 * The main server application.
 ***************************************************************************/


var express = require('express');
var simulator = require('./routes/simulator.js');
var prosumer = require('./routes/prosumer.js');
var db = require('./routes/db.js');
app = express();
port = process.env.PORT || 3000;

// Set static files folder
app.use(express.static('public'));

// Adds support for input from POST requests.
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Set ejs as the template engine
app.set('view engine', 'ejs');

// Setup the simulator routes
app.use('/simulator', simulator);

// Setup the prosumer routes
app.use('/prosumer', prosumer);

// Setup the database routes
app.use('/db', db);


app.listen(port);
