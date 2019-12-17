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
 * @param id the id of the prosumer checked for.
 */
exports.getProsumerExists =  async function(id) {
    console.log(`Log: Get prosumer exists.`);
    var results = await pool.query(`SELECT id FROM users WHERE role=$1 AND id=$2;`, ['prosumer', id]);
    return results.rows.length > 0;
}


/**
 * Inserts the prosumerd data.
 * @param {*} id the prosumers id.
 * @param {*} timeStamp the time in seconds.
 * @param {*} production the electricity production
 * @param {*} consumption the electricity consumption
 * @param {*} buffer the prosumers buffer object.
 */
exports.insertProsumerData = function(id, timeStamp, production, consumption, buffer) {
    console.log(`Log: Insert prosumer data`);
    pool.query(`INSERT INTO prosumer_data 
        (id, time, production, consumption, buffer, buffer_max, buffer_excessive_production_ratio,
            buffer_under_production_ratio) 
        VALUES ($1, to_timestamp($2), $3, $4, $5, $6, $7, $8)`, 
        [id, timeStamp, production, consumption, buffer.value, buffer.max, buffer.excessiveProductionRatio, 
            buffer.underProductionRatio], (error, results) => {});
}
