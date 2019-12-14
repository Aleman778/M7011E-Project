/**
 *  Define needed constants and global variable.
 */
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });

var windSim;


/**
 *  Sets the windSim variable which is the WindSim used to output to the socket.
 */
exports.setWindSim = function(windS) {
    windSim = windS;
}


/**
 *  Handles the socket connection and sending the wind speed data.
 */
wss.on('connection', function connection(ws) {
    console.log("WindSim Socket Connection Opened");
    var interval = setInterval(
        async function() {
            var obj = new Object();
            obj.time = new Date();
            obj.unit = windSim.unit;
            obj.wind_speed = await windSim.getWindSpeed(obj.time);
            ws.send(JSON.stringify(obj));
        }, 100);
    
    ws.on('close', function closing(message) {
        console.log("WindSim Socket Connection Closed");
        clearInterval(interval);
    });
});
