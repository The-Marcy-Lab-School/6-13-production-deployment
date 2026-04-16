// ====================================
// Imports / Constants
// ====================================

const path = require('path');
const express = require('express');

const cookieSession = require('cookie-session');

const logRoutes = require('./middleware/logRoutes');

const checkAuthentication = require('./middleware/checkAuthentication');

const { register, login, getMe, logout } = require('./controllers/authControllers');
const { listUsers, updateUser, deleteUser } = require('./controllers/userControllers');
const { listBookmarks, listUserBookmarks, createBookmark, updateBookmark, deleteBookmark } = require('./controllers/bookmarkControllers'); // NEW

const app = express();
const PORT = 8080;

const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
// ⚠️ Secret is hardcoded for development only — move to .env before deploying
app.use(cookieSession({
  name: 'session',
  secret: 'dev-only-secret-replace-before-deploying',
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, pathToFrontend)));

// ====================================
// Auth routes (public)
// ====================================

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', getMe);
app.delete('/api/auth/logout', logout);

// ====================================
// User routes
// ====================================

app.get('/api/users', listUsers);
app.get('/api/users/:user_id/bookmarks', listUserBookmarks); // NEW: returns bookmarks for one user
app.patch('/api/users/:user_id', checkAuthentication, updateUser);
app.delete('/api/users/:user_id', checkAuthentication, deleteUser);

// ====================================
// Bookmark routes — NEW
// ====================================

// Public feed — no authentication required
app.get('/api/bookmarks', listBookmarks);
// Write routes require a valid session
app.post('/api/bookmarks', checkAuthentication, createBookmark);
app.patch('/api/bookmarks/:bookmark_id', checkAuthentication, updateBookmark);
app.delete('/api/bookmarks/:bookmark_id', checkAuthentication, deleteBookmark);

// ====================================
// Global Error Handling
// ====================================

const handleError = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
};

app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
