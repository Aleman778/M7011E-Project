
/***************************************************************************
 * The simulator instance keeps track of the model 
 ***************************************************************************/


var WindSim = require('./src/windsim.js');
var ProsumerSim = require('./src/prosumer-sim.js');


/**
 * Simulator instance model.
 */
class Simulator {
    constructor() {
        this.wind = new WindSim(10, 5);
        this.prosumers = [];
    }

    
}


module.exports = new Simulator();
