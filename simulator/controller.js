
/***************************************************************************
 * The simulator controller handles different actions for the simulator
 * module.
 ***************************************************************************/


var simulator = require('./model.js');

exports.getWindSpeed = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var date = new Date();
    let wind_speed = simulator.wind.getWindSpeed(date.getHours());
    res.end(JSON.stringify({ wind_speed: wind_speed }));
}

