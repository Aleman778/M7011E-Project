
/***************************************************************************
 * The main server application.
 ***************************************************************************/


var express = require('express');
var simulator = require('./simulator/routes.js');
app = express();
port = process.env.PORT || 3000;


app.use('/simulator', simulator);

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    console.log("hello");
    res.end("Hello world again!")
})

app.listen(port);
