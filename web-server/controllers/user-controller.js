
/***************************************************************************
 * The user controller handles general actions that any user in the
 * system can perform such as login, signup, change basic settings.
 ***************************************************************************/


const User = require('../models/user');
const helper = require('../models/helper');


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
     * Register a new user this should be inherited
     * for each different kind of user in the system.
     */
    register(name, email, created_at) {
        throw new Error('There is no registration method for this user role.');
    }
    
    
    /**
     * Signup a new user account with a specific role.
     * The req.body parameters are expected to be validated already.
     */
    async signup(req, res, role) {
        User.findOne({email: req.body.email}).then(user => {
            if (user) {
                req.alert('danger', 'There already exists an account with that email address. ' +
                          'If this is your account you can signin instead.');
                return false;
            }
        });
        const passwordHash = helper.hashPassword(req.body.password);
        var user = new User(req.body.name, req.body.email, role);
        user.password = passwordHash;
        await user.store();
        const token = helper.generateToken(user);
        if (token) {
            req.session.token = token;
            return true;
        } else {
            req.alert('danger', 'Failed to create the account!');
        }
        return false
    }


    /**
     * Sign in as a user with a specific role.
     */
    async signin(req, res, role) {
        const user = await User.findMany({email: req.body.email});
        if (user.length > 0 && helper.comparePassword(req.body.password, user[0].password)) {
            if (user[0].role !== role) {
                req.alert('danger', 'The account you tried to sign in to is not a ' + role + ' account.');
                return false;
            }
            const token = helper.generateToken(user[0]);
            req.session.token = token;
            return true;
        } else {
            req.alert('danger', 'The email or password is incorrect, please try again.');
            return false;
        }
        return false;
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
                    req.alert('danger', 'There already exists an account with that email address. ' +
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
        if (req.file == undefined) {
            user.avatar_filename = null;
        } else {
            user.avatar_filename = req.file.filename;
        }
        user.update(['avatar_filename']);
        return true;
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
            req.alert('danger', 'The old password does not match your current password. ' +
                      'Please make sure that you enter the correct password and try again.');
            return false;
        }
    }
}


module.exports = UserController;
