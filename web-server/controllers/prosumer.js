
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


const UserController = require('./user');
const User = require('../models/user');
const helper = require('../models/helper');


/**
 * The different settings page.
 */
const settingsPages = ['profile', 'account', 'security', 'notifications'];


/**
 * The prosumer controller handles all the actions that a prosumer does
 * such as login, signup etc.
 */
class ProsumerController extends UserController {
    /**
     * Show a prosumers dashboard.
     * Should provide an auth middleware for accessing this.
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async viewDashboard(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            res.render('prosumer/index', {user: user});
        } catch(err) {
            res.send(400).send(err);
        }
    }


    /**
     * Show a prosumers settings view.
     * Should provide an auth middleware for accessing this.
     * @param {object} req the request object
     * @param {object} res the response object
     */
    async viewSettings(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            var page = (req.params.page || settingsPages[0]).toString();
            var pageIndex = settingsPages.indexOf(page);
            if (pageIndex == -1) {
                page = settingsPages[0];
                pageIndex = 0;
            }
            return res.render(
                'prosumer/settings',
                {
                    user: user,
                    alerts: req.alert(),
                    page: page,
                    pageIndex: pageIndex,
                }
            );
        } catch(err) {
            console.log(err);
            return res.send(400).send(err);
        }
    }
    
    
    /**
     * 
     * Should provide an auth middleware for accessing this.
     * @param {object} req the request object
     * @param {object} res the response object
     */
   async viewOverview(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            res.render('prosumer/overview', {user: user});
        } catch(err) {
            res.send(400).send(err);
        }
    }
}


/**
 * Exports prosumer controller instance.
 */
module.exports = new ProsumerController();
