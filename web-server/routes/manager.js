
/***************************************************************************
 * Defines the routes for the manager.
 ***************************************************************************/


var express = require('express');
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var upload = require('../middleware/upload');
var managerController = require('../controllers/manager-controller');
var powerPlantController = require('../controllers/power-plant-controller');
var marketController = require('../controllers/market-controller');
var router = express.Router();

/**
 * Enable the authorization middleware to accept managers.
 */
router.use(auth.enable('manager'));


/**
 * Views the /manager dashboard page.
 */
router.get('/', auth.verify, managerController.dashboard);


/**
 * Views the /manager/signin page.
 */
router.get('/signin', function(req, res) {
    res.render('manager/signin', {alerts: req.alert()});
});


/**
 * Views the /manager/signup page.
 */
router.get('/signup', function(req, res) {
    res.render('manager/signup', {alerts: req.alert()});
});


/**
 * POST request /manager/signin used for manager signin.
 */
router.post('/signin', validate.manager.signin, managerController.signin);


/**
 * POST request /manager/signup for creating a new manager account.
 */
router.post('/signup', validate.manager.signup, managerController.signup);


/**
 * POST request /manager/signout for signing out a manager account.
 */
router.get('/signout', auth.destroy, function(req, res) {
    res.redirect('./signin');
});


/**
 * GET request /manager/settings/:page for accessing a managers settings.
 * There are multiple pages containing settings provide a page as parameter.
 * Requires authentication in order to access.
 */
router.get('/settings/:page', auth.verify, managerController.settings);


/**
 * GET request /manager/settings for accessing a managers settings.
 * Simply redirects to the first available settings page.
 */
router.get('/settings', auth.verify, managerController.settings); 


/**
 * POST request /manager/settings/update/profile for updating the
 * managers profile settings.
 */
router.post('/settings/update/profile',
            [auth.verify, validate.manager.updateProfile],
            managerController.updateProfile);


/**
 * POST request /manager/settings/upload/avatar for uploading an
 * avatar image.
 */
router.post('/settings/upload/avatar',
            [auth.verify, upload.image('avatar')],
            managerController.updateAvatar);


/**
 * POST request /manager/settings/revert/gravatar for reverting the
 * avatar image to instead use the gravatar image.
 */
router.post('/settings/revert/gravatar', auth.verify, managerController.revertToGravatar);


/**
 * POST request /manager/settings/update/password for updating the
 * managers password.
 */
router.post('/settings/update/password',
            [auth.verify, validate.manager.updatePassword],
            managerController.updatePassword);


/**
 * Views the /manager/prosumers prosumers page.
 */
router.get('/prosumers', auth.verify, managerController.listProsumers);


/**
 * Views the /manager dashboard page.
 */
router.get('/control-panel', auth.verify, managerController.controlPanel);


/**
 * PUT request /manager/power-plant/production/level for updating the
 * power plants production level.
 */
router.put('/power-plant/production/level',
            [auth.verify, validate.powerPlant.updateLevel],
            powerPlantController.updateLevel);


/**
 * PUT request /manager/power-plant/market-ratio for updating the
 * power plants production ratio.
 */
router.put('/power-plant/market-ratio',
            [auth.verify, validate.powerPlant.updateRatio],
            powerPlantController.updateRatio);


/**
 * POST request /manager/power-plant/start for starting the power plant.
 */
router.post('/power-plant/start',
            auth.verify,
            powerPlantController.start);


/**
 * POST request /manager/power-plant/stop for stopping the power plant.
 */
router.post('/power-plant/stop',
            auth.verify,
            powerPlantController.stop);


/**
 * PUT request /manager/market/market/price for updating the
 * current market price of electricity.
 */
router.put('/market/price',
            [auth.verify, validate.manager.updatePrice],
            marketController.updatePrice);


/**
 * POST request /manager/remove/prosumer for removing a
 * prosumer account
 */
router.post('/prosumer/delete',
            auth.verify,
            managerController.removeProsumer);


/**
 * POST request /manager/prosumer/info for viewing
 * prosumer info.
 */
router.post('/prosumer/info',
            auth.verify,
            managerController.prosumerInfo);


/**
 * POST request /manager/block/prosumer for blocking
 * prosumer for selling.
 */
router.post('/prosumer/block',
            auth.verify,
            managerController.blockProsumer);


/**
 * POST request /manager/prosumers/get for getting
 * prosumers info.
 */
router.post('/prosumers/get',
            auth.verify,
            managerController.getProsumers);


/**
 * POST request /manager/prosumer/production/get for getting prosumer data.
 */
router.post('/prosumer/production/get',
            auth.verify,
            managerController.getCurrentProductionData);


/**
 * POST request /manager/prosumer/production/history/latest/get for getting prosumers
 * latest historical data.
 */
router.post('/prosumer/production/history/latest/get',
            auth.verify,
            managerController.getHistoricalProductionData);


/**
 * POST request /manager/power-plant/get for getting current power plant status.
 */
router.post('/power-plant/get',
            auth.verify,
            powerPlantController.getPowerPlant);


/**
 * POST request /manager/market/suggested-price for getting the 
 * power plants markets suggested price.
 */
router.post('/market/suggested-price',
            auth.verify,
            marketController.getSuggestedPrice);

    
/**
 * Post request /manager/market/market/price for getting the
 * current market price of electricity.
 */
router.post('/market/price',
            auth.verify,
            marketController.getPrice);


/**
 * POST request /manager/prosumers/get for getting
 * prosumers info.
 */
router.post('/prosumer/get',
            auth.verify,
            managerController.getProsumer);


/**
 * POST request /manager/prosumer/house for getting prosumer data.
 */
router.post('/prosumer/house',
            auth.verify,
            managerController.getHouse);


/**
 * POST request /manager/prosumer/house/history for getting a prosumers
 * latest historical house data.
 */
router.post('/prosumer/house/history',
            auth.verify,
            managerController.getHistoricalProductionData);

/**
 * Expose the router.
 */
module.exports = router;
