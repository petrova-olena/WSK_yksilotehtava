'use strict';

import {
  getUser,
  requireAuth,
  updateUserOnServer,
  deleteUserOnServer,
  uploadAvatarToServer,
} from './user.js';

import {getRestaurants} from './restaurant_cards.js';

// Ensure the user is authenticated before allowing access to the profile page
requireAuth();

let user = getUser();

// DOM elements
const userNameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const profilePhotoEl = document.getElementById('profile-photo');

const favoritesEmptyEl = document.getElementById('favorites-empty');
const favoriteRestaurantEl = document.getElementById('favorite-restaurant');

const editBtn = document.querySelector('.edit-profile-btn');
const editModal = document.getElementById('edit-modal');
const closeEditBtn = editModal?.querySelector('.close-login');

const deleteBtn = document.querySelector('.delete-profile-btn');
const uploadBtn = document.querySelector('.upload-photo-btn');
const avatarInput = document.getElementById('avatar-input');

// Fills in the user's basic information (username, email, avatar) on the profile page
function fillBasicInfo() {
  userNameEl.textContent = user.username || '—';
  emailEl.textContent = user.email || '—';

  profilePhotoEl.src = user.avatar
    ? `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`
    : 'assets/images/avatar.jpg';
}

// Fills in the user's favorite restaurant information on the profile page
async function fillFavoriteRestaurant() {
  if (!user.favouriteRestaurant) {
    favoritesEmptyEl.style.display = 'block';
    favoriteRestaurantEl.textContent = '';
    return;
  }

  favoritesEmptyEl.style.display = 'none';

  const restaurants = await getRestaurants();
  const fav = restaurants.find((r) => r._id === user.favouriteRestaurant);

  favoriteRestaurantEl.textContent = fav ? fav.name : 'Unknown restaurant';
}

// Initializes the profile page by filling in the user's basic information and favorite restaurant
async function initProfile() {
  fillBasicInfo();
  await fillFavoriteRestaurant();
}

initProfile();

// Handles the edit profile button click, showing the edit modal and pre-filling the form with current user data
editBtn?.addEventListener('click', () => {
  document.getElementById('edit-username').value = user.username || '';
  document.getElementById('edit-email').value = user.email || '';
  document.getElementById('edit-password').value = '';

  editModal.classList.remove('hidden');
});

// Handles the close button click on the edit modal, hiding the modal
closeEditBtn?.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

// Handles clicks outside the modal content to close the edit modal
editModal?.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.classList.add('hidden');
});

// Handles the save button click in the edit modal, sending updated user data to the server
// and updating the profile page on success
document.getElementById('save-profile')?.addEventListener('click', async () => {
  const updatedData = {
    username: document.getElementById('edit-username').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
  };

  // Only include password if it's not empty (user wants to change it)
  const newPassword = document.getElementById('edit-password').value.trim();
  if (newPassword) updatedData.password = newPassword;

  const result = await updateUserOnServer(updatedData);

  // If the update was successful, refresh the user data and update the profile page
  if (result.data) {
    alert('Profile updated successfully');
    user = getUser();
    fillBasicInfo();
    editModal.classList.add('hidden');
  } else {
    alert(result.message || result.error || 'Update failed');
  }
});

// Handles the delete account button click, asking for confirmation and then sending a delete request to the server
deleteBtn?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete your account?')) return;

  const result = await deleteUserOnServer();

  if (result.data) {
    alert('Your account has been deleted.');
    localStorage.clear();
    window.location.href = 'index.html';
  } else {
    alert(result.message || result.error || 'Failed to delete account');
  }
});

// Handles the upload avatar button click, triggering the hidden file input to open the file picker
uploadBtn?.addEventListener('click', () => avatarInput.click());

// Handles the file input change event, uploading the selected avatar file to the server
// and updating the profile page on success
avatarInput?.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const result = await uploadAvatarToServer(file);

  if (result.data) {
    alert('Avatar updated successfully');
    user = getUser();
    fillBasicInfo();
  } else {
    alert(result.error || 'Failed to upload avatar');
  }
});
