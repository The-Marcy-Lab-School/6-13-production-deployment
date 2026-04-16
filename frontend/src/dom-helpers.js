// DOM references — owned here, used only for rendering
const usersList = document.querySelector('#users-list');
const currentUsernameEl = document.querySelector('#current-username');
const guestControls = document.querySelector('#guest-controls');
const authControls = document.querySelector('#auth-controls');
const authSection = document.querySelector('#auth-section');
const usersSection = document.querySelector('#users-section');
const bookmarksSection = document.querySelector('#bookmarks-section'); // NEW
const bookmarksList = document.querySelector('#bookmarks-list');       // NEW
const addBookmarkForm = document.querySelector('#add-bookmark-form');  // NEW
const profileSection = document.querySelector('#profile-section');
const showProfileBtn = document.querySelector('#show-profile-btn');
const profileUsername = document.querySelector('#profile-username');
const profileUserId = document.querySelector('#profile-user-id');
const profileBookmarksList = document.querySelector('#profile-bookmarks-list'); // NEW
const ownProfileSettings = document.querySelector('#own-profile-settings');     // NEW

// ============================================
// Render
// ============================================

export const renderUsers = (users) => {
  usersList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.className = 'user-card';
    // NEW: data attributes store the user so click handlers can read them without an extra fetch
    li.dataset.userId = user.user_id;
    li.dataset.username = user.username;
    li.textContent = `@${user.username}`;

    const idSpan = document.createElement('span');
    idSpan.className = 'user-id';
    idSpan.textContent = `#${user.user_id}`;

    li.append(idSpan);
    usersList.append(li);
  });
};

// NEW: Helper that builds a single bookmark <li> card.
// showByline: include the clickable @username attribution (used in the public feed).
// showDelete: include the delete button (used for own bookmarks).
const createBookmarkCard = (bookmark, showDelete = false, showByline = false) => {
  const li = document.createElement('li');
  li.className = 'bookmark-card';

  // storing the bookmark id makes it easier for the delete click handler to know which bookmark to delete
  li.dataset.bookmarkId = bookmark.bookmark_id;

  // storing owner information lets click handlers know which user owns this bookmark
  li.dataset.userId = bookmark.user_id;

  const link = document.createElement('a');
  link.href = bookmark.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = bookmark.title;
  li.append(link);

  if (showByline) {
    // NEW: a button styled as a link — clicking it navigates to that user's profile
    const byline = document.createElement('span');
    byline.className = 'bookmark-byline';
    const usernameBtn = document.createElement('button');
    usernameBtn.className = 'username-link';
    usernameBtn.dataset.username = bookmark.username;
    usernameBtn.textContent = `@${bookmark.username}`;
    byline.append(usernameBtn);
    li.append(byline);
  }

  if (showDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-bookmark-btn';
    deleteBtn.textContent = 'Delete';
    li.append(deleteBtn);
  }

  return li;
};

// NEW: renders the public bookmarks feed.
// Each card shows the title link, a clickable @username byline, and (for own bookmarks) a delete button.
export const renderBookmarks = (bookmarks, currentUser) => {
  bookmarksList.innerHTML = '';
  if (bookmarks.length === 0) {
    bookmarksList.innerHTML = 'No bookmarks added yet';
    return;
  }
  bookmarks.forEach((bookmark) => {
    const isBookmarkOwner = Boolean(currentUser && bookmark.user_id === currentUser.user_id);
    bookmarksList.append(createBookmarkCard(bookmark, isBookmarkOwner, true));
  });
};

// CHANGED: previously renderProfile(user) — now takes bookmarks and isOwnProfile.
// Renders any user's profile. Pass isOwnProfile=true to reveal the settings panel.
export const renderProfile = (user, bookmarks, isOwnProfile) => {
  profileUsername.textContent = user.username;
  profileUserId.textContent = user.user_id;

  profileBookmarksList.innerHTML = '';
  bookmarks.forEach((bookmark) => {
    profileBookmarksList.append(createBookmarkCard(bookmark, isOwnProfile, false));
  });

  if (isOwnProfile) {
    ownProfileSettings.classList.remove('hidden');
  } else {
    ownProfileSettings.classList.add('hidden');
  }
};

// Switches the header and nav between guest mode and logged-in mode
export const renderAuthView = (currentUser) => {
  if (currentUser) {
    currentUsernameEl.textContent = `@${currentUser.username}`;
    guestControls.classList.add('hidden');
    authControls.classList.remove('hidden');
    authSection.classList.add('hidden');
    showProfileBtn.classList.remove('hidden');
    addBookmarkForm.classList.remove('hidden'); // NEW: show add-bookmark form when logged in
  } else {
    guestControls.classList.remove('hidden');
    authControls.classList.add('hidden');
    authSection.classList.add('hidden');
    showProfileBtn.classList.add('hidden');
    profileSection.classList.add('hidden');
    addBookmarkForm.classList.add('hidden'); // NEW: hide add-bookmark form for guests
  }
};

// ============================================
// Show / Hide sections
// ============================================

export const showAuthSection = () => {
  authSection.classList.remove('hidden');
};

// CHANGED: now also hides bookmarksSection (new third section)
export const showUsersSection = () => {
  usersSection.classList.remove('hidden');
  bookmarksSection.classList.add('hidden');
  profileSection.classList.add('hidden');
};

// NEW
export const showBookmarksSection = () => {
  bookmarksSection.classList.remove('hidden');
  usersSection.classList.add('hidden');
  profileSection.classList.add('hidden');
};

// CHANGED: now also hides bookmarksSection
export const showProfileSection = () => {
  profileSection.classList.remove('hidden');
  usersSection.classList.add('hidden');
  bookmarksSection.classList.add('hidden');
};

// ============================================
// Error display helpers
// ============================================

export const showError = (elementId, message) => {
  const el = document.querySelector(`#${elementId}`);
  el.textContent = message;
  el.classList.remove('hidden');
};

export const hideError = (elementId) => {
  const el = document.querySelector(`#${elementId}`);
  el.textContent = '';
  el.classList.add('hidden');
};
