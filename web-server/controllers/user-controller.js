
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
     * Creates a new user controller.
     */
    constructor() { }


    /**
     * Creates a new user model with a given name and email.
     */
    register(name, email) {
        throw new Error("The register() function in user controller extended classes needs to be implemented");
    }

    
    /**
     * Sign in a user with specified role.
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
                user.online()
                return user;
            }
        }
        req.err('The email or password is incorrect, please try again.');
        return undefined;
    }

    
    /**
     * Sign up as a user with specified role.
     */
    async signup(req, res, model, role) {
        try {
            let sameEmail = await User.findMany({email: req.body.email});
            if (sameEmail.length > 0) {
                req.err('There already exists an account with that email address. ' +
                        'If this is your account you can signin instead.');
                return undefined;
            }
            const passwordHash = helper.hashPassword(req.body.password);
            model.password = passwordHash;
            await model.store();
            const token = helper.generateToken(model);
            if (token) {
                req.session.token = token;
                model.online();
                return model;
            } else {
                req.err('Failed to create the account!');
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return undefined;
    }

    
    /**
     * Update the users profile details.
     */
    async updateProfile(req, res) {
        var redirect;
        try {
            const user = await User.findOne({id: req.userId});
            redirect = '/' + user.role + '/settings/profile';
            let update = false;
            if (req.body.name != user.name) {
                user.name = req.body.name;
                update = true;
            }
            if (req.body.email != user.email) {
                const sameEmail = await User.findMany({email: req.body.email});
                if (sameEmail.length > 0) {
                    if (user) {
                        req.err('There already exists an account with that email address. ' +
                                'Please choose a different email address that is not already taken.');
                    }
                } else {
                    user.email = req.body.email;
                    update = true;
                }
            }
            if (update) {
                req.success('Your profile settings have been updated.');
                await user.update(['name', 'email']);
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect(redirect);
    }
    

    /**
     * Upload a new avatar image.
     */
    async updateAvatar(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            if (user.avatar_filename) {
                try {
                    fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads',
                                            user.uuidHash(), user.avatar_filename));
                } catch(err) {
                    console.trace("[UserController] " + err);
                }
            }

            if (req.file == undefined) {
                user.avatar_filename = null;
            } else {
                user.avatar_filename = req.file.filename;
            }
            
            await user.update(['avatar_filename']);
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        var alerts = req.session.alerts;
        if (Object.entries(alerts).length === 0 && alerts.constructor === Object) {
            req.success('Your profile picture have been updated.');
            return res.status(200).render('partials/alerts', {
                alerts: req.alert()
            });
        } else {
            return res.status(400).send();
        }
    }


    /**
     * Revert a users avatar to instead use gravatar.
     */
    async revertToGravatar(req, res) {
        var redirect;
        try {
            const user = await User.findOne({id: req.userId});
            redirect = '/' + user.role + '/settings/profile';
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
            req.success('Your profile picture have been updated.');
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect(redirect);
    }
    
    
    /**
     * Update the users password.
     */
    async updatePassword(req, res) {
        var redirect;
        try {
            const user = await User.findOne({id: req.userId});
            var redirect = '/' + user.role + '/settings/security';
            if (helper.comparePassword(req.body.oldPassword, user.password)) {
                user.password = helper.hashPassword(req.body.newPassword);
                await user.update(['password']);
                req.success('Your password have been updated.');
            } else {
                req.err('The old password does not match your current password. ' +
                        'Please make sure that you enter the correct password and try again.');
            }
        } catch(err) {
            console.trace(err);
            req.whoops();
        }
        return res.redirect(redirect);
    }


    /**
     * Forwards a user to their respective role specific routes.
     */
    async forward(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            return res.redirect(req.path.replace('user', user.role));
        } catch(err) {
            console.trace(err);
        }
        req.status(400).send();
    }
}


module.exports = UserController;
