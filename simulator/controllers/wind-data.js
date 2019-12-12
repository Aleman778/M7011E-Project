/***************************************************************************
 * The queries controller defines the different queries and connection to
 * PostgreSQL database.
 ***************************************************************************/


/**
 * Defines a pool with the connection information.
 */
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: 'db',
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
})


/**
 * Returns the whole windspeed history.
 */
exports.getAllWindSpeed = function(req, res) {
  console.log(`Get all wind speeds from windData`);
  pool.query(`SELECT * FROM windData ORDER BY time DESC`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Returns the nearest wind speed that is lower or equal to timestamp.
 */
exports.getWindSpeedLowEqual = function(req, res) {
  console.log(`Get wind speed lower equal from windData`);
  pool.query(`SELECT * FROM windData WHERE time = (SELECT max(time) FROM windData WHERE time <= to_timestamp($1));`, [req.params.timestamp], (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Returns the nearest wind speed that is higher or equal to timestamp.
 */
exports.getWindSpeedHighEqual = function(req, res) {
  console.log(`Get wind speed higher or equal from windData`);
  pool.query(`SELECT * FROM windData WHERE time = (SELECT min(time) FROM windData WHERE time > to_timestamp($1));`, [req.params.timestamp], (error, results) => {
      if (error) {
      throw error
      }
      console.log(results.rows[0]);
      res.status(200).json(results.rows);
  })
}


/**
 * Returns the latest measured wind speed.
 */
exports.getLatestWindSpeed = function(req, res) {
  console.log(`Get latest wind speed from windData`);
  pool.query(`SELECT * FROM windData WHERE time = (SELECT max(time) FROM windData);`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Returns the two nearest wind speeds to timestamp, ordered buy time.
 */
exports.getNearestWindSpeeds = function(req, res) {
  console.log(`Get nearest wind speed from windData`);
  pool.query(`SELECT * FROM windData WHERE time = (SELECT max(time) FROM windData WHERE time <= to_timestamp($1)) UNION ALL SELECT * FROM windData WHERE time = (SELECT min(time) FROM windData WHERE time > to_timestamp($1));`, [req.params.timestamp], (error, results) => {
    if (error) {
    throw error
    }
    res.status(200).json(results.rows)
  })
}
