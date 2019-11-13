
/***************************************************************************
 * The simulator instance keeps track of the model 
 ***************************************************************************/


var WindSim = require('./../simulator/windsim.js');
var ProsumerSim = require('./../simulator/prosumer-sim.js');


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
