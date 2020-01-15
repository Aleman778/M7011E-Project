/***************************************************************************
 * The power plant controller handles different actions specific to the
 * power plant.
 ***************************************************************************/


/**
 * The power plant controller defines different actions that
 * be done to the power plant.
 */
class PowerPlantController {
    /**
     * Creates a new power plant controller.
     */
    contructor() {}
    

    /**
     * Starts the power plants production.
     */
    async start(req, res) {
        try {
            
            /**
             * @TODO start power plant in simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Stops the power plants production.
     */
    async stop(req, res) {
        try {
            /**
             * @TODO stop power plant in simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Update the power plants production level.
     */
    async updateLevel(req, res) {
        try {
            /**
             * @TODO Update level in simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }


    /**
     * Update the power plants production ratio.
     */
    async updateRatio(req, res) {
        try {
            /**
             * @TODO Update ratio in simulator.
             */
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }

}


/**
 * Expose the power plant controller instance.
 */
module.exports = new PowerPlantController();
