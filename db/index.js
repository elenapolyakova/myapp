const {Pool} = require('pg')
const pool = new Pool({
 host: 'localhost',
 database: 'El',	
 user: 'user_tt',
 password: '123123',
 max: 20,
 idleTimeoutMillis: 30000,
 connectionTimeout: 2000,
})


module.exports = {
 query: (text, params, callback) => {
  return pool.query(text, params, callback)
 },
}
