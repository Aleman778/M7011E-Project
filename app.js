var express = require('express');
app = express();
port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    
    res.end("Hello world again!")
})

app.listen(port);
