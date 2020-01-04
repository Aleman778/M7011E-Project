
/***************************************************************************
 * The prosumer model inherits the user model to provide more information
 * to users with the role as a prosumer.
 ***************************************************************************/


var User = require('./user');
var helper = require('./helper');
var db = require('../db');


/**
 * The prosumer class represents a user with role as prosumer.
 * Prosumer produces and consumes electricity and has a buffer.
 */
class Prosumer extends User {
    /**
     * Creates a new prosumer user.
     * @param {Object} data that can hold the following fields:
     */
    constructor(data) {
        data['role'] = 'prosumer';
        super(data);
        this.buffer = data.buffer || 0;
        this.buffer_max = data.buffer_max || 1000;
        this.buffer_storing_limit = data.buffer_storing_limit || 75;
        this.house_filename = data.house_filename || null;
    }
    
    
    /**
     * Tries to only find one prosumer in the database.
     * @returns {Promise} that resolves to only one if successful
     */
    static findOne(where) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let prosumers = await Prosumer.findMany(where);
                    if (prosumers.length != 1) {
                        reject("did not find one prosumer but " + prosumers.length + " instead");
                    } else {
                        resolve(prosumers[0]);
                    }
                } catch (err) {
                    reject(err);
                }
            })()
        });
    }


    /**
     * Tries to find many prosumers in the database.
     * @param {Object} where key-value pairs to match agains
     * @returns {Promise} that resolves to a list of prosumers if successful
     */
    static findMany(where) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    var result = [];
                    let { rows } = await db.select('prosumers', where);
                    for (var i = 0; i < rows.length; i++) {
                        let row = rows[i];
                        let user = await db.select('users', {id: row.id});
                        if (user.rows.length == 1) {
                            const data = {...row, ...user.rows[0]};
                            result.push(new Prosumer(data));
                        }
                    }
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }


    /**
     * Stores this prosumer in the database tables users and prosumers
     * with a password.
     * Note: you DO need to hash the password before calling this.
     */
    async store() {
        await super.store();
        const queryText = `INSERT INTO prosumers(id, buffer, buffer_max,
                               buffer_storing_limit, house_filename)
                               VALUES($1, $2, $3, $4, $5)`;
        const params = [
            this.id, this.buffer, this.buffer_max,
            this.buffer_storing_limit, this.house_filename];
        await db.query(queryText, params);
    }
    

    /**
     * Updates the specified fields from the prosumer/user object in the database.
     * Note: updated_at is automatically updated in the users  with the current time.
     * @param {array} fields containing strings of each field to include.
     */
    async update(fields) {
        await super.update(fields);
        var queryText = "UPDATE prosumers SET ";
        var params = [];
        var fields = fields || ['buffer', 'buffer_max',
                                'buffer_storing_limit', 'house_filename'];
        var index = 0;
        fields.forEach(field => {
            switch(field) {
            case 'buffer':
                params.push(this.buffer);
                break;
            case 'buffer_max':
                params.push(this.buffer_max);
                break;
            case 'buffer_storing_limit':
                params.push(this.buffer_storing_limit);
                break;
            case 'house_filename':
                params.push(this.house_filename);
                break;
            default:
                return;
            }
            queryText += field + " = $" + params.length;
            if (index < fields.length - 1) {
                queryText += ", ";
            }
            index += 1;
        });
        params.push(this.id);
        queryText += " WHERE id = $" + params.length;
        await db.query(queryText, params);
    }
}


/**
 * Expose the prosumer class.
 */
module.exports = Prosumer;
