/***************************************************************************

 * The entry point for the web-server application.
 ***************************************************************************/

var express = require('express');
var session = require('express-session');
var prosumer = require('./routes/prosumer');
var alerts = require('./routes/middleware/alerts');
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

app.use(alerts());

// Set static files folder.
app.use(express.static('public'));

// Set the view engine to use ejs.
app.set('view engine', 'ejs');

// Setup the simulator routes.
app.use('/prosumer', prosumer);

// Set up the database table (the hacky way)
var db = require('./db');
// db.dropUsersTable();
// db.createUsersTable();


// Testing the user creation and lookup
// (async() => {
//     const User = require('./models/user');
//     await new User("Firstname Lastname", "test@test.com", "prosumer", new Date(), new Date()).store("helloworld");
//     try {
//         let user = await User.findOne({email: "test@test.com", role: "prosumer"});
//         console.log(user);

//         user.remove("helloworld");
//     } catch (err) {
//         console.log(err);
//     }
// })()


app.listen(port);
