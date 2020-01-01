
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
     * Signin a prosumer.
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
            console.log(err);
            req.whoops();
        }
        return res.status(401).render('prosumer/signin', {alerts: req.alert()});
    }


    /**
     * Signup a prosumer of specified role.
     */
    async signup(req, res) {
        try {
            let sameEmail = await User.findMany({email: req.body.email});
            if (sameEmail.length > 0) {
                req.err('There already exists an account with that email address. ' +
                        'If this is your account you can signin instead.');
                return res.status(400).render('prosumer/signup', {alerts: req.alert()});
            }
            const passwordHash = helper.hashPassword(req.body.password);
            var prosumer = new Prosumer({name: req.body.name, email: req.body.email});
            prosumer.password = passwordHash;
            await prosumer.store();
            const token = helper.generateToken(prosumer);
            if (token) {
                req.session.token = token;
                return res.redirect('/prosumer');
            } else {
                req.err('Failed to create the account!');
            }
        } catch(err) {
            console.log(err);
            req.whoops();
        }
        return res.status(400).render('prosumer/signup', {alerts: req.alert()});
    }

    
    /**
     * Updates the prosumer public profile settings.
     */
    async updateProfile(req, res) {
        try {
            if (await super.updateProfile(req, res)) {
                req.success('Your profile settings have been updated.');
            }
        } catch (err) {
            req.whoops();
            console.log(err);
        }
        return res.redirect('/prosumer/settings/profile');
    }


    /**
     * Uploads a new avatar image, should replace the old.
     */
    async updateAvatar(req, res) {
        if (await super.updateAvatar(req, res)) {
            req.success('Your profile picture have been updated.');
            res = res.status(200);
        } else {
            res = res.status(400);
        }
        return res.render('partials/alerts', {alerts: req.alert()});
    }


    /**
     * Revert to using the gravatar profile picture instead.
     */
    async revertToGravatar(req, res) {
        if (await super.revertToGravatar(req, res)) {
            req.success('Your profile picture have been updated.');
        }
        return res.redirect('/prosumer/settings/profile');
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
            console.log(err);
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
     * Remove an account from the database.
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
                console.log(err);
                req.warn('Some files uploaded by you were not deleted properly.');
            }
            return res.redirect('/prosumer/signin');
        } catch (err) {
            console.log(err);
            req.err(err.message);
            return res.redirect('/prosumer/settings/account');
        }
    }

    
    /**
     * Update the prosumer password.
     */
    async updatePassword(req, res) {
        try {
            if (await super.updatePassword(req, res)) {
                req.success('Your password have been updated.');
            }
        } catch (err) {
            console.log(err);
            req.whoops();
        }
        return res.redirect('/prosumer/settings/security');
    }
    

    /**
     * Show a prosumers dashboard.
     * Should provide an auth middleware for accessing this.
     */
    async dashboard(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            res.render('prosumer/index', {user: prosumer});
        } catch(err) {
            console.log(err);
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
            console.log(err);
            return res.status(400).send(err);
        }
    }
    
    
    /**
     * Should provide an auth middleware for accessing this.
     */
    async overview(req, res) {
        try {
            const prosumer = await Prosumer.findOne({id: req.userId});
            res.render('prosumer/overview', {user: prosumer});
        } catch(err) {
            console.log(err);
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
