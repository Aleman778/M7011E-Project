/***************************************************************************
 * The queries controller defines the different queries and connection to
 * Postgresql database.
 ***************************************************************************/


/**
 * Defines a pool with the connection information.
 */
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'admin',
  host: 'db',
  database: 'windSim',
  password: 'admin',
  port: 5432,
})


/**
 * Returns the whole windspeed history.
 */
const getAllWindSpeed = (request, response) => {
  console.log("getAllWindSpeed");
    pool.query('SELECT * FROM wind ORDER BY measured ASC', (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

/**
 * Returns the whole windspeed history.
 */
const insertWindSpeed = (request, response) => {
  console.log("insertWindSpeed");
    pool.query("INSERT INTO wind VALUES ('" + req.params.timeStamp + "','" +  req.params.windSpeed  + "'); ", (error, results) => {
        if (error) {
        throw errors
        }
        response.status(200).json(results.rows)
    })
}


module.exports = {
  getALlWindSpeed,
  insertWindSpeed,
}