
/***************************************************************************
 * The entry point for the web-server application.
 ***************************************************************************/

var express = require('express');
var prosumer = require('./routes/prosumer.js');
app = express();
port = process.env.PORT || 3000;

// Adds support for input from POST requests.
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients).
app.use(express.json());

// Set static files folder.
app.use(express.static('public'));

// Set the view engine to use ejs.
app.set('view engine', 'ejs');

// Setup the simulator routes.
app.use('/prosumer', prosumer);

app.listen(port);
