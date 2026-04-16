import {
  getCurrentUser,
  register,
  login,
  logout,
  getUsers,
  updatePassword,
  deleteUser,
  getUserBookmarks, // NEW
  getBookmarks,     // NEW
  createBookmark,   // NEW
  deleteBookmark,   // NEW
} from './fetch-helpers.js';

import {
  renderUsers,
  renderBookmarks,      // NEW
  renderProfile,
  renderAuthView,
  showAuthSection,
  showUsersSection,
  showBookmarksSection, // NEW
  showProfileSection,
  showError,
  hideError,
} from './dom-helpers.js';

// ================================================
// DOM References (for event handling only)
// ================================================

const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const changePasswordForm = document.querySelector('#change-password-form');
const showAuthBtn = document.querySelector('#show-auth-btn');
const logoutBtn = document.querySelector('#logout-btn');
const showUsersBtn = document.querySelector('#show-users-btn');
const showBookmarksBtn = document.querySelector('#show-bookmarks-btn'); // NEW
const showProfileBtn = document.querySelector('#show-profile-btn');
const deleteAccountBtn = document.querySelector('#delete-account-btn');
const addBookmarkForm = document.querySelector('#add-bookmark-form');   // NEW
const bookmarksList = document.querySelector('#bookmarks-list');         // NEW
const usersList = document.querySelector('#users-list');
const profileBookmarksList = document.querySelector('#profile-bookmarks-list'); // NEW

// ================================================
// In Memory Data
// ================================================

let currentUser = null;

// ================================================
// Refresh / Navigation Helpers
// ================================================

const refreshUsers = async () => {
  const { data: users } = await getUsers();
  renderUsers(users || []);
};

// NEW
const refreshBookmarks = async () => {
  const { data: bookmarks } = await getBookmarks();
  renderBookmarks(bookmarks || [], currentUser);
};

// NEW: central helper for navigating to any user's profile.
// Fetches their bookmarks, then passes isOwnProfile so renderProfile knows whether to show settings.
const showProfile = async (user) => {
  const { data: bookmarks } = await getUserBookmarks(user.user_id);
  const isOwnProfile = currentUser && currentUser.user_id === user.user_id;
  renderProfile(user, bookmarks || [], isOwnProfile);
  showProfileSection();
};

// ================================================
// Event Handlers
// ================================================

// Register: create account -> auto-login -> show users
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('register-error');
  const { data: user, error } = await register(
    registerForm.username.value,
    registerForm.password.value,
  );
  if (error) return showError('register-error', 'Username already taken.');
  currentUser = user;
  renderAuthView(currentUser);
  registerForm.reset();
  showUsersSection();
  await refreshUsers();
});

// Login: validate credentials -> set session -> show users
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('login-error');
  const { data: user, error } = await login(
    loginForm.username.value,
    loginForm.password.value,
  );
  if (error) return showError('login-error', 'Invalid username or password.');
  currentUser = user;
  renderAuthView(currentUser);
  loginForm.reset();
  showUsersSection();
  await refreshUsers();
});

// Logout: clear session -> return to guest view -> show users
logoutBtn.addEventListener('click', async () => {
  await logout();
  currentUser = null;
  renderAuthView(null);
  showUsersSection();
  await refreshUsers();
});

// Change password: update own record -> stay on profile
changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('change-password-error');
  const { error } = await updatePassword(currentUser.user_id, changePasswordForm.password.value);
  if (error) return showError('change-password-error', 'Could not update password.');
  changePasswordForm.reset();
  alert('Password updated.');
});

// Delete account: remove own record -> log out -> return to guest view
deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm('Delete your account? This cannot be undone.')) return;
  await deleteUser(currentUser.user_id);
  await logout();
  currentUser = null;
  renderAuthView(null);
  showUsersSection();
  await refreshUsers();
});

// NEW: add bookmark: submit form -> create -> refresh list
addBookmarkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('add-bookmark-error');
  const { error } = await createBookmark(
    addBookmarkForm.title.value,
    addBookmarkForm.url.value,
  );
  if (error) return showError('add-bookmark-error', 'Could not save bookmark.');
  addBookmarkForm.reset();
  await refreshBookmarks();
});

// NEW: one delegated listener handles two click targets in the bookmarks feed:
// — delete button (own bookmarks only) and @username link (navigate to profile)
bookmarksList.addEventListener('click', async (e) => {
  // Get the closest list item, it has the bookmarkId, userId, and username stored in its dataset
  const li = e.target.closest('.bookmark-card');
  if (!li) return;

  // See if the delete button was clicked
  const deleteBtn = e.target.closest('.delete-bookmark-btn');
  if (deleteBtn) {
    const bookmarkId = Number(li.dataset.bookmarkId);
    await deleteBookmark(bookmarkId);
    await refreshBookmarks();
    return;
  }

  // See if the username button was clicked
  const usernameBtn = e.target.closest('.username-link');
  if (usernameBtn) {
    const userId = Number(li.dataset.userId);
    const username = usernameBtn.dataset.username;
    await showProfile({ user_id: userId, username });
  }
});

// NEW: delegated listener for delete buttons in the profile bookmarks list.
// After deleting, re-calls showProfile to re-fetch and re-render with the updated list.
// user_id comes from the deleted card's dataset; username comes from the rendered profile header.
profileBookmarksList.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-bookmark-btn');
  if (!deleteBtn) return;
  const li = deleteBtn.closest('.bookmark-card');
  const bookmarkId = Number(li.dataset.bookmarkId);
  const userId = Number(li.dataset.userId);
  const username = document.querySelector('#profile-username').textContent;
  await deleteBookmark(bookmarkId);
  await showProfile({ user_id: userId, username });
});

// NEW: clicking a user card navigates to their profile.
// The user data comes from data attributes set by renderUsers — no extra fetch needed.
usersList.addEventListener('click', async (e) => {
  const card = e.target.closest('.user-card');
  if (!card) return;
  const userId = Number(card.dataset.userId);
  const username = card.dataset.username;
  await showProfile({ user_id: userId, username });
});

// Nav: show All Users section
showUsersBtn.addEventListener('click', async () => {
  showUsersSection();
  await refreshUsers();
});

// NEW: nav button for the all bookmarks feed
showBookmarksBtn.addEventListener('click', async () => {
  showBookmarksSection();
  await refreshBookmarks();
});

// CHANGED: now calls showProfile(currentUser) instead of renderProfile(currentUser) directly —
// showProfile also fetches bookmarks and handles the isOwnProfile flag
showProfileBtn.addEventListener('click', async () => {
  await showProfile(currentUser);
});

// Header: reveal auth section
showAuthBtn.addEventListener('click', showAuthSection);

// ================================================
// Initialization
// ================================================

// On every page load: check session -> update view -> load users
const main = async () => {
  const { data } = await getCurrentUser();
  currentUser = data;
  renderAuthView(currentUser);
  await refreshUsers();
};

main();
