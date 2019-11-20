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
  pool.query('SELECT * FROM wind ORDER BY (year, day, hour) ASC', (error, results) => {
      if (error) {
      throw error
      }
      res.status(200).json(results.rows)
  })
}


/**
 * Inserts historical windspeed data into database.
 */
insertWindSpeed = function (year, day, hour, windSpeed, unit) {
  console.log("insertWindSpeed");
  pool.query(`INSERT INTO wind (year, day, hour, windSpeed, unit) VALUES (${year}, ${day}, ${hour}, ${windSpeed}, '${unit}')`, (error, results) => {
    // if (error) {
    //   throw error;
    // }
  });
}


module.exports = {
  getAllWindSpeed,
  insertWindSpeed,
}
