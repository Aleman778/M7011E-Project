
/***************************************************************************
 * The user model defines a generic user in the system.
 ***************************************************************************/

const db = require('../db');
const helper = require('./helper');
const uuid = require('uuid/v4');
const md5 = require('md5');

/**
 * The user class is an abstract class
 */
class User {

    /**
     * Creates a new user with the given data.
     * @param {Object} data that can hold the following fields:
     * - {String} name the name of the user
     * - {String} email the user email address
     * - {String} role the user role in the system
     * - {Date} created at timestamp
     * - {Date} updated at timestamp
     * - {UUID} id the users primary key
     * - {Object} created and updated at timestamps
     * - {String} password the hashed password (do not store cleartext passwords)
     * - {String} avatar_filename the filename for avatar image or null for gravatar
     * - {Boolean} removed is used to flag user as removed.
     */
    constructor(data) {
        this.id = data.id || uuid();
        this.name = data.name;
        this.email = data.email;
        this.password = data.password || null;
        this.role = data.role;
        this.avatar_filename = data.avatar_filename || null;
        this.removed = data.removed || false;
        this.created_at = data.created_at || new Date();
        this.updated_at = data.updated_at || new Date();
        this.online_at = data.online_at || new Date();
    }


    /**
     * Tries to find a user with the given properties e.g.
     * `let user = User.findOne({email: "test@test.com"});`
     * If there are multiple results found then this will be rejected.
     * For retreving many users use the User.findMany method instead.
     * @param {object} where properties to check against.
     * @returns {Promise} resolves to a User if successful otherwise rejects with error.
     */
    static findOne(where) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let users = await User.findMany(where);
                    if (users.length != 1) {
                        reject("did not find one user but " + users.length + " instead");
                    } else {
                        resolve(users[0]);
                    }
                } catch (err) {
                    reject(err);
                }
            })()
        });
    }

 
    /**
     * Finds all the users with the given properties,
     * set where to {} for selecting all users. E.g.
     * `let user = User.findOne({email: "test@test.com"});`
     * If you only want to accept one user then 
     * Note: removed users are not considered!
     * @param {Array} where properties to check against.
     * @returns {Promise}  if successful it resolves to an array of User
     *                     objects otherwise rejects with error.
     */
    static findMany(where) {
        where['removed'] = false;
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    var users = []
                    let { rows } = await db.select('users', where);
                    rows.forEach(function(data) {
                        users.push(new User(data));
                    });
                    resolve(users);
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }
    
    
    /**
     * Stores this user in the database with a password.
     * Note: you DO need to hash the password before calling this.
     * @returns {Promise} that resolves to pg result if successful else rejects pg error
     */
    store() {
        if (this.removed) {
            throw new Error("cannot store a user that has been removed.");
        }
        if (!this.password) {
            throw new Error("Cannot store a user without a password.");
        }
        const queryText = `INSERT INTO users(id, name, email, password, role,
                           avatar_filename, removed, created_at, updated_at, online_at)
                           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        const params = [
            this.id, this.name, this.email, this.password, this.role,
            this.avatar_filename, this.removed,  this.created_at, this.updated_at, this.online_at];
        return db.query(queryText, params);
    }


    /**
     * Updates the specified fields from the user object in the database.
     * Note: updated_at is automatically updated with the current time.
     * @param {array} fields containing strings of each field to include.
     */
    update(fields) {
        if (this.removed) {
            throw new Error("cannot update a user that has been removed");
        }
        var queryText = "UPDATE users SET ";
        var params = [];
        var fields = fields || ['name', 'email', 'password', 'role', 'avatar_filename'];
        fields.forEach(field => {
            switch(field) {
            case 'name':
                params.push(this.name);
                break;
            case 'email':
                params.push(this.email);
                break;
            case 'password':
                params.push(this.password);
                break;
            case 'role':
                params.push(this.role);
                break;
            case 'avatar_filename':
                params.push(this.avatar_filename);
                break;
            default:
                return;
            }
            queryText += field + " = $" + params.length + ", ";
        });

        this.updated_at = new Date();
        params.push(this.updated_at);
        queryText += "updated_at = $" + params.length + ", ";

        this.online_at = new Date();
        params.push(this.online_at);
        queryText += "online_at = $" + params.length + " ";

        params.push(this.id);
        queryText += "WHERE id = $" + params.length + " AND removed = FALSE";
        return db.query(queryText, params);
    }


    online() {
        this.online_at = new Date();
        console.log("[online] " + this.online_at );
        let queryText = "UPDATE users SET online_at = $1 WHERE id = $2 AND removed = FALSE";
        let params = [this.online_at, this.id];
        db.query(queryText, params);
    }
     

    /**
     * Removes a user from the service. The cleartext password is
     * required as a security measure so that a user is not accidentally removed.
     */
    remove(password) {
        if (!this.password) {
            throw new Error("Please specifiy your password in order to remove the user.");
        } else if (helper.comparePassword(password, this.password)) {
            const queryText = `UPDATE users
                SET name = 'Removed', email = $1, password = 'removed',
                role = 'removed', removed=TRUE, updated_at = $2
                WHERE id = $3 AND removed = FALSE`;
            const params = [uuid(), new Date(), this.id];
            db.query(queryText, params);
        } else {
            throw new Error("Your password is incorrect, please try again.")
        }
    }


    /**
     * Return a md5 hash of the UUID number of this user, used
     * for storing public files without giving away the users id.
     */
    uuidHash() {
        return md5(this.id);
    }
    

    /**
     * Return a md5 hash of the users email, used for retreving
     * gravatar images.
     */
    emailHash() {
        return md5(this.email.trim().toLowerCase());
    }
}


module.exports = User;
