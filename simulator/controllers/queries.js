/***************************************************************************
 * The queries controller defines the different queries and connection to
 * Postgresql database.
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
const getAllWindSpeed = (req, res) => {
  console.log(`Get all wind speeds from${process.env.PG_TABLE_WIND}`);
  pool.query(`SELECT * FROM ${process.env.PG_TABLE_WIND} ORDER BY time DESC`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Returns the wind speed.
 */
const getWindSpeed = (req, res) => {
  console.log(`Get wind speed from ${process.env.PG_TABLE_WIND}`);
  pool.query(`SELECT * FROM ${process.env.PG_TABLE_WIND} WHERE time = to_timestamp(${req.params.timestamp});`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Returns the wind speed.
 */
const getLatestWindSpeed = (req, res) => {
  console.log(`Get latest wind speed from ${process.env.PG_TABLE_WIND}`);
  pool.query(`SELECT * FROM ${process.env.PG_TABLE_WIND} WHERE time = (SELECT max(time) FROM ${process.env.PG_TABLE_WIND});`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Inserts historical windspeed data into database.
 * @param timeStamp the date the wind was measured.
 * @param windSpeed the measured wind speed.
 * @param unit the unit the wind speed was measured in.
 */
insertWindSpeed = function (timeStamp, windSpeed, unit) {
  console.log(`insert wind speed into ${process.env.PG_TABLE_WIND}`);
  pool.query(`INSERT INTO ${process.env.PG_TABLE_WIND} (time, windSpeed, unit) VALUES (to_timestamp($1), $2, $3)`, [timeStamp, windSpeed, unit], (error, results) => {
    // if (error) {
    //   throw error;
    // }
  });
}


module.exports = {
  getAllWindSpeed,
  insertWindSpeed,
  getWindSpeed,
  getLatestWindSpeed,
}
