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
exports.insertProsumerData = function(id, timeStamp, production, consumption, net_consumption) {
    console.log(`Log: Insert prosumer data`);
    pool.query(`INSERT INTO prosumer_data 
        (id, time, production, consumption, net_consumption) 
        VALUES ($1, to_timestamp($2), $3, $4, $5)`, 
        [id, timeStamp, production, consumption, net_consumption], (error, results) => {});
}


/**
 * Gets all prosumer IDs.
 * @param {*} id the prosumers id.
 * @param {*} timeStamp the time in seconds.
 */
exports.getNearestProsumerData =  async function(id, timeStamp) {
    console.log(`Log: nearest prosumer data.`);
    var results = await pool.query(`SELECT * FROM prosumer_data WHERE time = (SELECT max(time) FROM prosumer_data WHERE id = $1
        AND time <= to_timestamp($2)) UNION ALL SELECT * FROM prosumer_data WHERE time = (SELECT min(time) FROM prosumer_data
        WHERE id = $1 AND time > to_timestamp($2));`, [id, timeStamp]);
    return results.rows;
}


/**
 * Gets prosumers buffer status.
 * @param {*} id the prosumers id.
 */
exports.getProsumerBufferStatus = async function(id) {
    console.log(`Log: Select prosumer buffer status`);
    var results = await pool.query(`SELECT buffer, buffer_max, excessive_production_ratio, under_production_ratio
        FROM prosumers WHERE id = $1`, [id]);
    return results.rows;
}


/**
 * Update prosumers buffer settings.
 * @param {*} id the prosumers id.
 * @param {*} max the buffers max value.
 * @param {*} excessiveProductionRatio the percent of excessive production that will be stored.
 * @param {*} underProductionRatio the percent of used from the buffer in the case of under production.
 */
exports.updateProsumerBufferSettings = function(id, max, excessiveProductionRatio, underProductionRatio) {
    console.log(`Log: Update prosumer buffer settings`);
    pool.query(`UPDATE prosumers 
        SET buffer_max = $2, excessive_production_ratio = $3, under_production_ratio = $4
        WHERE id = $1`, 
        [id, max, excessiveProductionRatio, underProductionRatio], (error, results) => {});
}
