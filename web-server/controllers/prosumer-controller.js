
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/


var UserController = require('./user-controller');
var Prosumer = require('../models/prosumer');
var User = require('../models/user');
var helper = require('../models/helper');
var path = require('path');
var fs = require('fs');


/**
 * The different settings page.
 */
const settingsPages = ['profile', 'account', 'security'];


/**
 * The prosumer controller handles all the actions that a prosumer does
 * such as login, signup etc.
 */
class ProsumerController extends UserController {
    /**
     * Creates a new prosumer controller.
     */
    constructor() {
        super();
    }


    /**
     * Sign in a prosumer.
     */
    async signin(req, res) {
        try {
            if (await super.signin(req, res, 'prosumer')) {
                if (req.session.redirectTo) {
                    let url = req.session.redirectTo;
                    req.session.redirectTo = undefined;
                    return res.redirect(url);
                } else {
                    return res.redirect('/prosumer');
                }
            }
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        return res.status(401).render('prosumer/signin', {alerts: req.alert()});
    }


    /**
     * Sign up a prosumer.
     */
    async signup(req, res) {
        var model = new Prosumer({name: req.body.name, email: req.body.email});
        try {
            if (await super.signup(req, res, model, 'prosumer')) {
                return res.redirect('/prosumer');
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.status(400).render('prosumer/signup', {alerts: req.alert()});

    }


    /**
     * Upload an image of your house. This should be stored
     * in the prosumers private storage.
     */
    async uploadHouse(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            if (prosumer.house_filename) {
                try {
                    fs.unlinkSync('./private/' + prosumer.uuidHash() + '/' +
                                  prosumer.house_filename);
                } catch(err) {
                    console.error("[ProsumerController] " + err);
                }
            }

            if (req.file == undefined) {
                prosumer.house_filename = null;
            } else {
                prosumer.house_filename = req.file.filename;
            }
            
            await prosumer.update(['house_filename']);
        } catch (err) {
            console.trace(err);
            req.whoops();
        }
        var alerts = req.session.alerts;
        if (Object.entries(alerts).length === 0 && alerts.constructor === Object) {
            req.success('The picture of your house have been updated.');
            res = res.status(200);
        } else {
            res = res.status(400);
        }
        return res.render('partials/alerts', {alerts: req.alert()});
    }


    /**
     * Remove the image of your house from the server.
     */
    async removeHouse(req, res) {
        const prosumer = await Prosumer.findOne({id: req.userId});
        if (prosumer.house_filename) {
            try {
                fs.unlinkSync(path.join(__dirname, '..', 'private',
                                        prosumer.uuidHash(), prosumer.house_filename));
            } catch(err) {
                console.error("[ProsumerController] " + err);
            }
        }
        prosumer.house_filename = null;
        await prosumer.update(['house_filename']);
        return res.redirect('/prosumer/settings/account');
    }


    /**
     * Remove a prosumer account from the database.
     */
    async deleteAccount(req, res) {
        const prosumer = await Prosumer.findOne({id: req.userId});
        try {
            prosumer.remove(req.body.password);
            req.success('Your account was successfully deleted.');
            try {
                rmdirRecursive(path.join(__dirname, '..', 'private', prosumer.uuidHash()));
                rmdirRecursive(path.join(__dirname, '..', 'public', 'uploads', prosumer.uuidHash()));
                req.success('Your uploaded files were successfully deleted.');
            } catch (err) {
                console.trace(err);
                req.warn('Some files uploaded by you were not deleted properly.');
            }
            return res.redirect('/prosumer/signin');
        } catch (err) {
            console.trace(err);
            req.err(err.message);
            return res.redirect('/prosumer/settings/account');
        }
    }
    

    /**
     * Show a prosumers dashboard.
     * Should provide an auth middleware for accessing this.
     */
    async dashboard(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            prosumer.online();
            res.render('prosumer/dashboard', {user: prosumer});
        } catch(err) {
            console.trace(err);
            req.whoops();
            return res.redirect('/prosumer/signin');
        }
    }


    /**
     * Show a prosumers settings view.
     * Should provide an auth middleware for accessing this.
     */
    async settings(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            prosumer.online();
            var page = (req.params.page || settingsPages[0]).toString();
            var pageIndex = settingsPages.indexOf(page);
            if (pageIndex == -1) {
                page = settingsPages[0];
                pageIndex = 0;
            }
            return res.render(
                'prosumer/settings',
                {
                    user: prosumer,
                    alerts: req.alert(),
                    page: page,
                    pageIndex: pageIndex,
                }
            );
        } catch(err) {
            console.trace(err);
            return res.status(400).send(err);
        }
    }
    
    
    /**
     * Should provide an auth middleware for accessing this.
     */
    async overview(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            prosumer.online();
            res.render('prosumer/overview', {user: prosumer});
        } catch(err) {
            console.trace(err);
            return res.status(400).send(err);
        }
    }
}


/**
 * Delete an entire folder recursively
 */
function rmdirRecursive(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file, index) => {
            const curDir = path.join(dir, file);
            if (fs.lstatSync(curDir).isDirectory()) {
                deleteFolderRecursive(curDir);
            } else {
                fs.unlinkSync(curDir);
            }
        });
        fs.rmdirSync(dir);
    }
};


/**
 * Exports prosumer controller instance.
 */
module.exports = new ProsumerController();
