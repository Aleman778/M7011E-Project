
/***************************************************************************
 * Defines the RESTful API of routes available in the simulator
 ***************************************************************************/


var express = require('express');
var controller = require('./../controllers/simulator.js');
var router = express.Router();


/**
 * Get request for retrieving the wind information.
 */
router.get('/wind', controller.getWindSpeed);


router.get('/prosumer/:id', function (req, res) {
    res.end("prosumer " + req.params.id);
});



module.exports = router;
