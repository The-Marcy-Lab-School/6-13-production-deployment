// NEW file — bookmark model (mirrors the pattern in userModel.js)
const pool = require('../db/pool');

// Returns all bookmarks joined with the username of the owner.
// The JOIN is what makes the public feed possible — without it we'd only have user_id.
module.exports.list = async () => {
  const query = `
    SELECT bookmarks.bookmark_id, bookmarks.title, bookmarks.url, bookmarks.user_id, users.username
    FROM bookmarks
    JOIN users ON bookmarks.user_id = users.user_id
    ORDER BY bookmarks.bookmark_id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all bookmarks for a specific user
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT bookmark_id, title, url, user_id
    FROM bookmarks
    WHERE user_id = $1
    ORDER BY bookmark_id
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Creates a bookmark owned by the user
module.exports.create = async (user_id, title, url) => {
  const query = `
    INSERT INTO bookmarks (user_id, title, url)
    VALUES ($1, $2, $3)
    RETURNING bookmark_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [user_id, title, url]);
  return rows[0];
};

// Finds a single bookmark by id — used by updateBookmark and deleteBookmark before their
// ownership checks. Unlike users, the bookmark URL only contains bookmark_id, not user_id,
// so we have to look up the owner from the database rather than the URL params.
module.exports.find = async (bookmark_id) => {
  const query = 'SELECT bookmark_id, title, url, user_id FROM bookmarks WHERE bookmark_id = $1';
  const { rows } = await pool.query(query, [bookmark_id]);
  return rows[0] || null;
};

// Updates a bookmark's title and url
module.exports.update = async (bookmark_id, title, url) => {
  const query = `
    UPDATE bookmarks
    SET title = $1, url = $2
    WHERE bookmark_id = $3
    RETURNING bookmark_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [title, url, bookmark_id]);
  return rows[0] || null;
};

// Deletes a bookmark — returns the deleted row or null
module.exports.destroy = async (bookmark_id) => {
  const query = `
    DELETE FROM bookmarks
    WHERE bookmark_id = $1
    RETURNING bookmark_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [bookmark_id]);
  return rows[0] || null;
};
