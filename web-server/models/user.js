
/***************************************************************************
 * The user model defines a generic user in the system.
 ***************************************************************************/

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')


/**
 * The user class is an abstract class
 */
class User {

    /**
     * Creates a new user with the given data.
     * @param {uuid} id the users primary key
     * @param {string} email the user email address
     * @param {string} role the user role in the system
     * @param {date} created at timestamp
     * @param {date} updated at timestamp
     * @param {object} created and updated at timestamps
     */
    constructor(id, email, role, created_at, updated_at) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }


    
    

    /**
     * Stores this user in the database with a password.
     * Note: you do not need to hash it this is done here before insert.
     * @param {string} password in clear text
     * @returns a promise containing the result if successfull.
     */
    store(password) {
        const hash = hashPassword(password);
        const queryText = `INSERT INTO ${process.env.PG_TABLE_USERS}
            (id, email, password, role, created_at, updated_at)
            VALUES($1, $2, $3, $4, $5)`;
        const params = [this.id, this.email, hash, this.role, this.created_at, this.updated_at]
        return db.query(queryText, params);
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
function hashPassword() {
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
