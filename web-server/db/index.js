
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
