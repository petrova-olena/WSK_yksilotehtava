'use strict';

import {getRestaurants} from './restaurant_cards.js';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

/* ---------------------------------------------------
   1. AUTH CHECK
--------------------------------------------------- */

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'index.html';
}

/* ---------------------------------------------------
   2. DOM ELEMENTS
--------------------------------------------------- */

const userNameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const profilePhotoEl = document.getElementById('profile-photo');

const favoritesEmptyEl = document.getElementById('favorites-empty');
const favoriteRestaurantEl = document.getElementById('favorite-restaurant');

const editBtn = document.querySelector('.edit-profile-btn');
const editModal = document.getElementById('edit-modal');
const closeEditBtn = editModal.querySelector('.close-login');

const deleteBtn = document.querySelector('.delete-profile-btn');
const uploadBtn = document.querySelector('.upload-photo-btn');
const avatarInput = document.getElementById('avatar-input');

/* ---------------------------------------------------
   3. API FUNCTIONS
--------------------------------------------------- */

async function updateUser(data) {
  try {
    const response = await fetch(apiUrl + '/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    return {message: 'Server error'};
  }
}

async function deleteUserAPI() {
  try {
    const response = await fetch(apiUrl + '/users', {
      method: 'DELETE',
      headers: {Authorization: 'Bearer ' + token},
    });

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    return {message: 'Server error'};
  }
}

async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(apiUrl + '/users/avatar', {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + token},
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {message: 'Server error'};
  }
}

/* ---------------------------------------------------
   4. FILL BASIC PROFILE INFO
--------------------------------------------------- */

function fillBasicInfo() {
  userNameEl.textContent = user.username || '—';
  emailEl.textContent = user.email || '—';

  profilePhotoEl.src = user.avatar
    ? `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`
    : 'assets/images/avatar.jpg';
}

/* ---------------------------------------------------
   5. LOAD FAVORITE RESTAURANT
--------------------------------------------------- */

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

/* ---------------------------------------------------
   6. INIT PROFILE
--------------------------------------------------- */

async function initProfile() {
  fillBasicInfo();
  await fillFavoriteRestaurant();
}

initProfile();

/* ---------------------------------------------------
   7. EDIT PROFILE MODAL
--------------------------------------------------- */

editBtn.addEventListener('click', () => {
  document.getElementById('edit-username').value = user.username || '';
  document.getElementById('edit-email').value = user.email || '';
  document.getElementById('edit-password').value = '';

  editModal.classList.remove('hidden');
});

closeEditBtn.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.classList.add('hidden');
});

/* ---------------------------------------------------
   8. SAVE PROFILE CHANGES
--------------------------------------------------- */

document.getElementById('save-profile').addEventListener('click', async () => {
  const updatedData = {
    username: document.getElementById('edit-username').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
  };

  const newPassword = document.getElementById('edit-password').value.trim();
  if (newPassword) updatedData.password = newPassword;

  const result = await updateUser(updatedData);

  if (result.data) {
    alert('Profile updated successfully');

    localStorage.setItem('user', JSON.stringify(result.data));
    Object.assign(user, result.data);

    fillBasicInfo();
    editModal.classList.add('hidden');
  } else {
    alert(result.message || 'Update failed');
  }
});

/* ---------------------------------------------------
   9. DELETE ACCOUNT
--------------------------------------------------- */

deleteBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete your account?')) return;

  const result = await deleteUserAPI();

  if (result.data) {
    alert('Your account has been deleted.');
    localStorage.clear();
    window.location.href = 'index.html';
  } else {
    alert(result.message || 'Failed to delete account');
  }
});

/* ---------------------------------------------------
   10. UPLOAD AVATAR
--------------------------------------------------- */

uploadBtn.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const result = await uploadAvatar(file);

  if (result.data) {
    alert('Avatar updated successfully');

    user.avatar = result.data.avatar;
    localStorage.setItem('user', JSON.stringify(user));

    profilePhotoEl.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${result.data.avatar}`;
  } else {
    alert(result.error || 'Failed to upload avatar');
  }
});
