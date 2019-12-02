
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


exports.createUsersTable = function() => {
    const queryText =
        `CREATE TABLE IF NOT EXISTS ${process.env.PG_TABLE_USERS} (
            id UUID PRIMARY KEY
            email VARCHAR(128) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
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


exports.dropUsersTable = function() => {
    const queryText = `DROP TABLE IF EXISTS ${process.env.PG_TABLE_USERS} returning *`;
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


pool.on('remove', () => {
    console.log('client removed');
    process.exit(0);
})


