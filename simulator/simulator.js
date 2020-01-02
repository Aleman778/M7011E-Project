
/***************************************************************************
 * The main simulator application.
 ***************************************************************************/


/**
 * The simulator class is responsible for updating the
 * simulation state at every time step. The simulation
 * can be stored in a database and restored when restarting.
 * The simulator also keeps track of the time and date.
 */
class Simulator {
    /**
     * Creates a new simulation with optional parameters.
     * @param stepSize the number of milliseconds until next step
     * @param startTime the time at which the simulator starts at,
     *        if set to null the simulator always uses current date.
     */
    constructor(stepSize=1000, startTime=null) {
        this.stepSize = stepSize;
        this.time = startTime;
        this.stopTime = null;
    }


    /**
     * Restore the previous simulation session from database.
     * This is only required when starting up.
     */
    restore() {
        
    }


    /**
     * Runs the simulation in an "infinite loop".
     * The simulation lifetime is endless but can be changed.
     * @param lifetime 
     */
    run(lifetime) {
        if (this.time == null)
            this.time = new Date();
        if (typeof lifetime != "undefined")
            this.stopTime = incrTime(this.time, lifetime);
        this.stepInterval = setInterval(() => {
            this._step()
        }, this.stepSize);
    }


    /**
     * Step event is called for each time the simulation should
     * update the state and progress the time.
     */
    _step() {
        this.time = incrTime(this.time, this.stepSize);
        if (this._shouldStop()) {
            return;
        }
        
        console.log("Step at " + this.time);
        this._checkpoint();
    }

    
    /**
     * Checkpoint event is called for each time the simulation
     * should store the state in the database. This should not
     * progress the time, the step function does that.
     */
    _checkpoint() {
        if (this._shouldStop()) {
            return;
        }
        console.log("Checkpoint at " + this.time);
    }

    
    _shouldStop() {
        if (this.stopTime && this.time > this.stopTime) {
            clearInterval(this.stepInterval);
            return true;
        } else {
            return false;
        }
    }
}


/**
 * Pure utility function to increase the time
 * by delta milliseconds.
 */
function incrTime(date, delta) {
    var time = date.getTime();
    time += delta;
    return new Date(time);
}


/**
 * Exposes the simulator class.
 */
module.exports = Simulator;
