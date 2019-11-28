
/***************************************************************************
 * The main server application.
 ***************************************************************************/


var express = require('express');
var simulator = require('./routes/simulator.js');
var db = require('./routes/db.js');
app = express();
port = process.env.PORT || 3000;

// Adds support for input from POST requests.
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Setup the simulator routes
app.use('/simulator', simulator);

// Setup the database routes
app.use('/db', db);


app.listen(port);
