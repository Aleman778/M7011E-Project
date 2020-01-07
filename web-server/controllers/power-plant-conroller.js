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
     * Creates a new manager controller.
     */
    contructor() { }
    

    /**
     * Update the power plants production level.
     */
    async updateLevel(req, res) {
        try {
            
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
            
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect('/manager/control-panel');
    }

}


/**
 * Expose the manager controller instance.
 */
module.exports = new PowerPlantController();
