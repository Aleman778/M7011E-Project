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
  pool.query(`SELECT * FROM ${process.env.PG_TABLE_WIND} ORDER BY (year, day, hour) ASC`, (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Inserts historical windspeed data into database.
 * @param year the year the measurement was taken.
 * @param day the day the measurement was taken.
 * @param hour the hour the measurement was taken.
 * @param windSpeed the measured wind speed.
 * @param unit the unit the wind speed was measured in.
 */
insertWindSpeed = function (year, day, hour, windSpeed, unit) {
  console.log(`insert wind speed into${process.env.PG_TABLE_WIND}`);
  pool.query(`INSERT INTO ${process.env.PG_TABLE_WIND} (year, day, hour, windSpeed, unit) VALUES (${year}, ${day}, ${hour}, ${windSpeed}, '${unit}')`, (error, results) => {
    // if (error) {
    //   throw error;
    // }
  });
}


module.exports = {
  getAllWindSpeed,
  insertWindSpeed,
}
