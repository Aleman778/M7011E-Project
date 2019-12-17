/**
 * Defines a pool with the connection information.
 */
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'electricity_grid',
    host: 'db',
    database: 'electricity_grid',
    password: process.env.ELECTRICITY_GRID_PASSWORD,
});


/**
 * Gets all prosumer IDs.
 */
exports.getAllProsumerIDs =  async function() {
    console.log(`Log: Get all prosumer IDs.`);
    var results = await pool.query(`SELECT id FROM users WHERE role=$1;`, ['prosumer']);
    return results.rows;
}


/**
 * Get true if prosumer exists.
 */
exports.getProsumerExists =  async function(id) {
    console.log(`Log: Get prosumer exists.`);
    var results = await pool.query(`SELECT id FROM users WHERE role=$1 AND id=$2;`, ['prosumer', id]);
    return results.rows.length > 0;
}
