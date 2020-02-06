
/***************************************************************************
 * The entry point for the web-server application.
 ***************************************************************************/

var fs = require('fs');
var path = require('path');
var express = require('express');
var session = require('express-session');
var prosumer = require('./routes/prosumer');
var manager = require('./routes/manager');
var myfiles = require('./routes/myfiles');
var alerts = require('./middleware/alerts');
var User = require('./models/user');
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
    },
}));

// Adds support for input from POST requests.
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients).
app.use(express.json());

// Enable the ability to create alerts.
app.use(alerts());

// Set static files folder.
app.use(express.static(path.join(__dirname, 'public')));
try {
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads'));
} catch(err) { }
try {
    fs.mkdirSync(path.join(__dirname, 'private'));
    console.log("Creating private folder.");
} catch(err) { }

// Set the view engine to use ejs.
app.set('view engine', 'ejs');

// Render the home page.
app.get('/', async (req, res) => {
    let manager = await User.findMany({role: 'manager'});
    if (manager.length == 0) {
        return res.render("setup", {alerts: req.alert()});
    } else {
        return res.render('index');
    }
});

// Setup the prosumer routes.
app.use('/prosumer', prosumer);

// Setup the manager routes.
app.use('/manager', manager);

// Setup the myfiles routes.
app.use('/myfiles', myfiles);

// Starts the server 
app.listen(port);

