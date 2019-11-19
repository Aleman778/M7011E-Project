const Pool = require('pg').Pool
const pool = new Pool({
  user: 'admin',
  host: 'db',
  database: 'windSim',
  password: 'admin',
  port: 5432,
})


const getALlWindSpeed = (request, response) => {
  console.log("getALlWindSpeed");
    pool.query('SELECT * FROM wind ORDER BY measured ASC', (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}


module.exports = {
  getALlWindSpeed,
}