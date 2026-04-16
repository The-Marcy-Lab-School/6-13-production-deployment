const { Pool } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'users_db',
  // user: 'username', // <-- update me (or delete for MacOS)
  // password: 'password', // <-- update me (or delete for MacOS)
};

const pool = new Pool(config);

module.exports = pool;
