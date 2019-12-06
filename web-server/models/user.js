
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
     * Login a user by specifying the email and password in cleartext.
     * If the login is successful then a signed token is returned.
     * This token is required when accessing webpages that require autorized access.
     * The token also includes the role for user access control.
     * @param {string} email the users email address.
     * @param {}
     * @returns {jwt token} signed token if login was successful
     */
    static login(email, password) {
        (async () => {
            try {
                let user = await findOne({email: email});
                if (comparePassword(password, user.password)) {
                    return generateToken(user);   
                } else {
                    throw new Error("The username or password is incorrect.")
                }
            } catch (err) {
                return err;
            }
        })()
    }

    
    /**
     * Stores this user in the database with a password.
     * Note: you do not need to hash it this is done here before insert.
     * @param {string} password in clear text
     * @returns {jwt token} signed token if creation was successful
     */
    store(password) {
        if (this.removed == true) {
            throw new Error("cannot store a user that already has been removed");
        }
        
        this.password = hashPassword(password);
        const queryText = `INSERT INTO users(id, name, email, password, role, removed, created_at, updated_at)
                           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
        const params = [
            this.id, this.name, this.email, this.password,
            this.role, this.removed, this.created_at, this.updated_at];
        (async () => {
            try {
                await db.query(queryText, params);
                return generateToken(this);
            } catch (err) {
                return null;
            }
        })()
    }


    /**
     * Removes a user from the service. The cleartext password is
     * required as a security measure so that a user is not accidentally removed.
     */
    remove(password) {
        if (this.password == undefined) {
            throw new Error("Please specifiy your password in order to remove the user.");
        } else if (comparePassword(password, this.password)) {
            const queryText = `UPDATE users
                SET name = 'Removed', email = $1, password = 'removed', role = 'removed', removed=TRUE, updated_at = $2
                WHERE id = $3 AND removed=FALSE`;
            const params = [uuid(), new Date(), this.id];
            db.query(queryText, params);
        } else {
            throw new Error("Your provided password is incorrect.")
        }
    }
}


/***************************************************************************
 * Helper methods
 ***************************************************************************/


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
function generateToken(user) {
    const token = jwt.sign(
        {
            userId: user.id,
            userRole: user.role,
        },
        process.env.WS_PRIVATE_KEY,
        {
            algorithm: process.env.WS_ALGORITHM,
            expiresIn: "1d",
        }    
    );

    return token;
}


/***************************************************************************
 * Export the User class and validation function.
 ***************************************************************************/


module.exports = User;
