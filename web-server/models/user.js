
/***************************************************************************
 * The user model defines a generic user in the system.
 ***************************************************************************/

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const uuid = require('uuid/v4');


/**
 * The user class is an abstract class
 */
class User {

    /**
     * Creates a new user with the given data.
     * @param {uuid} id the users primary key
     * @param {string} name the name of the user
     * @param {string} email the user email address
     * @param {string} the hashed password (do not store cleartext passwords)
     * @param {string} role the user role in the system
     * @param {date} created at timestamp
     * @param {date} updated at timestamp
     * @param {object} created and updated at timestamps
     */
    constructor(name, email, role, created_at, updated_at, id=uuid(), password=undefined, removed=false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.removed = removed;
        this.created_at = created_at;
        this.updated_at = updated_at;
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
        })
    }




    /**
     * Finds all the users with the given properties,
     * set where to {} for selecting all users. E.g.
     * `let user = User.findOne({email: "test@test.com"});`
     * If you only want to accept one user then 
     * Note: removed users are not considered!
     * @param {Arr} where properties to check against.
     * @returns {Promise}  if successful it resolves to an array of User
     *                     objects otherwise rejects with error.
     */
    static findMany(where) {
        return new Promise((resolve, reject) => {
            (async () => {
                var props = [];
                var values = [];
                for (var prop in where) {
                    if (Object.prototype.hasOwnProperty.call(where, prop)) {
                        props.push(prop);
                        values.push(where[prop]);
                    }
                }
                var queryText = "SELECT * FROM users WHERE removed=FALSE";
                if (props.length > 0) {
                    for (var i = 0; i < props.length; i += 1) {
                        queryText += " AND " + props[i] + " = $" + (i + 1);
                    }
                }
                try {
                    var users = []
                    let { rows } = await db.query(queryText, values);
                    rows.forEach(function(row) {
                        users.push(new User(row.name, row.email, row.role, row.created_at,
                                            row.updated_at, row.id, row.password, row.removed));
                    });
                    resolve(users);
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            })()
        });
    }
    

    /**
     * Stores this user in the database with a password.
     * Note: you do not need to hash it this is done here before insert.
     * @param {string} password in clear text
     * @returns a promise containing the result if successfull.
     */
    store(password) {
        if (this.removed == true) {
            throw new Error("cannot store a user that already has been removed");
        }
        
        this.password = hashPassword(password);
        const queryText = `INSERT INTO users(id, name, email, password, role, removed, created_at, updated_at)
                           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
        const params = [
            this.id, this.name, this.email, this.password, this.role, this.removed, this.created_at, this.updated_at]
        return db.query(queryText, params);
    }


    /**
     * Removes a user from the service. The cleartext password is
     * required as a security measure so that a user is not accidentally removed.
     */
    remove(password) {
        if (this.password == undefined) {
            throw new Error("Please specifiy your password in order to remove the user");
        } else if (comparePassword(password, this.password)) {
            const queryText = `UPDATE users
                SET name = 'Removed', email = $1, password = 'removed', role = 'removed', removed=TRUE, updated_at = $2
                WHERE id = $3 AND removed=FALSE`;
            const params = [uuid(), new Date(), this.id];
            db.query(queryText, params);
        }
    }
}


/***************************************************************************
 * Helper methods
 ***************************************************************************/


/**
 * Validates the data provided by post request body.
 * @param {object} body the post request body
 * @returns {Array} the list of potential errors
 */
function validateUser(body) {
    var errors = [];
    if (!body.email || !body.password) {
        errors.insert("Some fields are missing values");
        return errors;
    }

    if (!isValidEmail(body.email)) {
        errors.insert("Please check you email address")
    }

    return errors;
}


/**
 * Validates an email address.
 * @param {string} email the email to verify
 * @param {bool} returns true if email is valid
 */
function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


/**
 * Hash and salt the password using bcrypt.
 */
function hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}


/**
 * Compare the given password with the hash.
 */
function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash)
}


/**
 * Generates a login token that is used to
 * verfiy that a user has logged in.
 */
function generateToken() {
    
}


/***************************************************************************
 * Export the User class and validation function.
 ***************************************************************************/


exports.User = User;
exports.validate = validateUser;
