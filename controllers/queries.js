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
const getAllWindSpeed = (req, res) => {
  console.log("getAllWindSpeed");
  pool.query('SELECT * FROM wind ORDER BY measured ASC', (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}

/**
 * Returns the whole windspeed history.
 */
const insertWindSpeed = (req, res) => {
  console.log("insertWindSpeed");
  pool.query(`INSERT INTO wind (measured, windSpeed) VALUES (to_timestamp(${Date.now()} / 1000.0), ${req.params.windSpeed})`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}


module.exports = {
  getAllWindSpeed,
  insertWindSpeed,
}
