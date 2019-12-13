/***************************************************************************
 * The queries controller defines the different queries and connection to
 * PostgreSQL database.
 ***************************************************************************/


/**
 * Defines a pool with the connection information.
 */
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'climate',
  host: 'db',
  database: 'climate',
  password: process.env.CLIMATE_PASSWORD,
})


/**
 * Returns the whole windspeed history.
 */
exports.getAllWindSpeed = function(req, res) {
  console.log(`Get all wind speeds from wind_data`);
  pool.query(`SELECT * FROM wind_data ORDER BY time DESC`, (error, results) => {
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
  console.log(`Get wind speed lower equal from wind_data`);
  pool.query(`SELECT * FROM wind_data WHERE time = (SELECT max(time) FROM wind_data WHERE time <= to_timestamp($1));`, [req.params.timestamp], (error, results) => {
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
  console.log(`Get wind speed higher or equal from wind_data`);
  pool.query(`SELECT * FROM wind_data WHERE time = (SELECT min(time) FROM wind_data WHERE time > to_timestamp($1));`, [req.params.timestamp], (error, results) => {
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
  console.log(`Get latest wind speed from wind_data`);
  pool.query(`SELECT * FROM wind_data WHERE time = (SELECT max(time) FROM wind_data);`, (error, results) => {
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
  console.log(`Get nearest wind speed from wind_data`);
  pool.query(`SELECT * FROM wind_data WHERE time = (SELECT max(time) FROM wind_data WHERE time <= to_timestamp($1)) UNION ALL SELECT * FROM wind_data WHERE time = (SELECT min(time) FROM wind_data WHERE time > to_timestamp($1));`, [req.params.timestamp], (error, results) => {
    if (error) {
    throw error
    }
    res.status(200).json(results.rows)
  })
}
