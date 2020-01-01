
/***************************************************************************
 * The user controller handles general actions that any user in the
 * system can perform such as login, signup, change basic settings.
 ***************************************************************************/


var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var helper = require('../models/helper');


/**
 * Abstract user controller defines basic user functions that
 * are not specific to the user role. This class should not
 * be instantiated but only extended to provide the full
 * feature set for the specific user role.
 */
class UserController {
    /**
     * Creates a new prosumer controller.
     */
    constructor() { }

    /**
     * Sign in a user of specified role.
     */
    async signin(req, res, role) {
        let users = await User.findMany({email: req.body.email});
        if (users.length > 0) {
            const user = users[0];
            if (user.role !== role) {
                req.err('The account you tried to sign in to is not a ' + role + ' account.');
                return undefined;
            }
            if (helper.comparePassword(req.body.password, user.password)) {
                const token = helper.generateToken(user);
                req.session.token = token;
                return user;
            }
        }
        req.err('The email or password is incorrect, please try again.');
        return undefined;
    }

    
    /**
     * Update the users profile details.
     */
    async updateProfile(req, res) {
        const user = await User.findOne({id: req.userId});
        if (req.body.email != user.email) {
            const sameEmail = await User.findMany({email: req.body.email});
            User.findOne({email: req.body.email}).then(user => {
                if (user) {
                    req.err('There already exists an account with that email address. ' +
                            'Please choose a different email address that is not already taken.');
                    return false;
                }
            });
        }
        user.name = req.body.name;
        user.email = req.body.email;
        await user.update(['name', 'email']);
        return true;
    }
    

    /**
     * Upload a new avatar image.
     */
    async updateAvatar(req, res) {
        const user = await User.findOne({id: req.userId});
        if (user.avatar_filename) {
            try {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads',
                                        user.uuidHash(), user.avatar_filename));
            } catch(err) {
                console.error("[UserController] " + err);
            }
        }

        if (req.file == undefined) {
            user.avatar_filename = null;
        } else {
            user.avatar_filename = req.file.filename;
        }
        
        await user.update(['avatar_filename']);
        var alerts = req.session.alerts;
        return Object.entries(alerts).length === 0 && alerts.constructor === Object;
    }


    /**
     * Revert a users avatar to instead use gravatar.
     */
    async revertToGravatar(req, res) {
        const user = await User.findOne({id: req.userId});
        if (user.avatar_filename) {
            try {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads',
                                        user.uuidHash(), user.avatar_filename));
            } catch(err) {
                console.error("[UserController] " + err);
            }
        }
        user.avatar_filename = null;
        
        await user.update(['avatar_filename']);
        var alerts = req.session.alerts;
        return Object.entries(alerts).length === 0 && alerts.constructor === Object;
    }
    
    
    /**
     * Update the users password.
     */
    async updatePassword(req, res) {
        const user = await User.findOne({id: req.userId});
        if (helper.comparePassword(req.body.oldPassword, user.password)) {
            user.password = helper.hashPassword(req.body.newPassword);
            await user.update(['password']);
            return true;
        } else {
            req.err('The old password does not match your current password. ' +
                    'Please make sure that you enter the correct password and try again.');
            return false;
        }
    }
}


module.exports = UserController;
