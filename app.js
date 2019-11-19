
/***************************************************************************
 * The main server application.
 ***************************************************************************/


var express = require('express');
var simulator = require('./routes/simulator.js');
var db = require('./routes/db.js');
app = express();
port = process.env.PORT || 3000;


app.use('/simulator', simulator);
app.use('/db', db);

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    console.log("hello");
    res.end("Hello world again!")
})

app.listen(port);
