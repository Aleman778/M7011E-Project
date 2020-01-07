
/***************************************************************************
 * Defines the routes for the manager.
 ***************************************************************************/


var express = require('express');
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var upload = require('../middleware/upload');
var managerController = require('../controllers/manager-controller');
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
 * Expose the router.
 */
module.exports = router;
