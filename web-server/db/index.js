
/***************************************************************************
 * The database module is an interface to the database tables
 * regarding the web-server e.g. the prosumer table.
 ***************************************************************************/

const { Pool } = require('pg');


/**
 * Defines the database connection.
 */
const pool = new Pool({
    user: process.env.PG_USER,
    host: 'db',
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
});

pool.on('connect', () => {
    console.log('connected to db')
});


exports.createUsersTable = function() {
    const queryText =
        `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            email VARCHAR(128) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
            role VARCHAR(20) NOT NULL,
            removed BOOL NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )`;

    pool.query(queryText)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
}


exports.dropUsersTable = function() {
    const queryText = `DROP TABLE IF EXISTS users`;
    pool.query(queryText)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((res) => {
            console.log(err);
            pool.end();
        });
}


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


pool.on('remove', () => {
    console.log('client removed');
})
