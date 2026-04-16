// db/seed.js
const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
  // CHANGED: must drop bookmarks before users — bookmarks has a FK referencing users
  await pool.query('DROP TABLE IF EXISTS bookmarks'); // NEW
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  // TODO: Add a bookmarks table — user_id is a FK so deleting a user cascades to their bookmarks
  await pool.query(`
    CREATE TABLE bookmarks (
      bookmark_id  SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      url          TEXT NOT NULL,
      user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // 1. Hash the passwords first
  const aliceHash = await bcrypt.hash('password123', SALT_ROUNDS);
  const bobHash = await bcrypt.hash('hunter2', SALT_ROUNDS);
  const carolHash = await bcrypt.hash('opensesame', SALT_ROUNDS);

  // 2. Define a SQL query string that returns the user_id
  const insertUserSql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;';

  // 3. Execute queries and store the full result objects
  const aliceResponse = await pool.query(insertUserSql, ['alice', aliceHash]);
  const bobResponse = await pool.query(insertUserSql, ['bob', bobHash]);
  const carolResponse = await pool.query(insertUserSql, ['carol', carolHash]);

  // 4. Extract the IDs for later use (e.g., seeding bookmarks)
  const aliceId = aliceResponse.rows[0].user_id;
  const bobId = bobResponse.rows[0].user_id;
  const carolId = carolResponse.rows[0].user_id;

  // NEW: seed some bookmarks so the app has data to display on first load
  const bookmarkQuery = 'INSERT INTO bookmarks (user_id, title, url) VALUES ($1, $2, $3)';
  await pool.query(bookmarkQuery, [aliceId, 'MDN Web Docs', 'https://developer.mozilla.org']);
  await pool.query(bookmarkQuery, [aliceId, 'Node.js Docs', 'https://nodejs.org/en/docs']);
  await pool.query(bookmarkQuery, [bobId, 'Express Docs', 'https://expressjs.com']);
  await pool.query(bookmarkQuery, [bobId, 'PostgreSQL Docs', 'https://www.postgresql.org/docs']);
  await pool.query(bookmarkQuery, [carolId, 'JavaScript.info', 'https://javascript.info']);

  console.log('Database seeded.');
};

seed()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
