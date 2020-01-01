
/***************************************************************************
 * The database module is an interface to the database tables
 * regarding the web-server e.g. the prosumer table.
 ***************************************************************************/

const { Pool } = require('pg');


/**
 * Defines the database connection.
 */
const pool = new Pool({
    user: 'electricity_grid',
    host: 'db',
    database: 'electricity_grid',
    password: process.env.ELECTRICITY_GRID_PASSWORD,
});


/**
 * Executes a query to the database, optionally with paramters.
 * @param {string} queryText the actual SQL query
 * @param {Array} array of parameters to send with query
 * @returns a promise that either resolvs to a result or rejects if query fails.
 */
exports.query = function(queryText, params) {
    return new Promise((resolve, reject) => {
        pool.query(queryText, params)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
    });
}


/**
 * Builds a simple SQL `SELECT * FROM` query based on
 * the given table and list of parameters in where object.
 * This only works for simple AND conditions `cond1 AND cond2 AND ...`.
 * @param {String} table the table to select from
 * @param {Object} where the list of key value pairs to check agains.
 * @returns {Promise} that resolves if successful to pg result else rejects pg error.
 */
exports.select = function(table, where) {
    var props = [];
    var values = [];
    for (var prop in where) {
        if (Object.prototype.hasOwnProperty.call(where, prop)) {
            props.push(prop);
            values.push(where[prop]);
        }
    }
    var queryText = "SELECT * FROM " + table + " WHERE ";
    if (props.length > 0) {
        for (var i = 0; i < props.length; i += 1) {
            queryText += (i > 0 ? " AND " : "") + props[i] + "=$" + (i + 1);
        }
    }
    return exports.query(queryText, values);
}
