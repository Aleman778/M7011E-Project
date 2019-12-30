
/***************************************************************************
 * The entry point for the web-server application.
 ***************************************************************************/

var path = require('path');
var express = require('express');
var session = require('express-session');
var prosumer = require('./routes/prosumer');
var myfiles = require('./routes/myfiles');
var alerts = require('./middleware/alerts');
var auth = require('./middleware/auth');
app = express();
port = process.env.WEB_SERVER_PORT || 3100;


// Setup express session
app.set('trust proxy', 1)
app.use(session({
    name: "qid",
    secret: process.env.WS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    }, // Use secure=true for https enabled server.
}));

// Adds support for input from POST requests.
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients).
app.use(express.json());

// Enable the ability to create alerts.
app.use(alerts());

// Set static files folder.
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to use ejs.
app.set('view engine', 'ejs');

// Setup the simulator routes.
app.use('/prosumer', prosumer);

// Setup the myfiles routes.
app.use('/myfiles', myfiles);

app.listen(port);
