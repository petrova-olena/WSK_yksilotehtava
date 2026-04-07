'use strict';

import {getRestaurants} from './restaurant_cards.js';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

/* ---------------------------------------------------
   1. API FUNCTIONS
--------------------------------------------------- */

async function updateUser(data, token) {
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

async function deleteUser(token) {
  try {
    const response = await fetch(apiUrl + '/users', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    return {message: 'Server error'};
  }
}

async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(apiUrl + '/users/avatar', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {message: 'Server error'};
  }
}

/* ---------------------------------------------------
   2. AUTH CHECK
--------------------------------------------------- */

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'index.html';
}

/* ---------------------------------------------------
   3. DOM ELEMENTS
--------------------------------------------------- */

const userNameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const profilePhotoEl = document.getElementById('profile-photo');
const favoritesListEl = document.getElementById('favorites-list');
const favoritesEmptyEl = document.getElementById('favorites-empty');

const editBtn = document.querySelector('.edit-profile-btn');
const editModal = document.getElementById('edit-modal');
const closeEditBtn = editModal.querySelector('.close-login');
const deleteBtn = document.querySelector('.delete-profile-btn');
const uploadBtn = document.querySelector('.upload-photo-btn');
const avatarInput = document.getElementById('avatar-input');

console.log('TOKEN FROM LS:', token);
console.log('USER FROM LS:', user);
console.log('editBtn:', editBtn);
console.log('editModal:', editModal);

/* ---------------------------------------------------
   4. INITIAL PROFILE FILL
--------------------------------------------------- */

emailEl.textContent = user.email || '—';
userNameEl.textContent = user.username || '—';
profilePhotoEl.src = user.avatar
  ? `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`
  : 'assets/images/avatar.jpg';

async function fillFavoriteRestaurant() {
  if (!user.favouriteRestaurant) {
    favoritesEmptyEl.style.display = 'block';
    return;
  }

  favoritesEmptyEl.style.display = 'none';

  // Загружаем рестораны
  const restaurants = await getRestaurants();

  // Ищем ресторан по ID
  const fav = restaurants.find((r) => r._id === user.favouriteRestaurant);

  // Выводим название
  const favEl = document.getElementById('favorite-restaurant');
  favEl.textContent = fav ? fav.name : 'Unknown restaurant';
}
fillFavoriteRestaurant();
async function initProfile() {
  emailEl.textContent = user.email || '—';
  userNameEl.textContent = user.username || '—';
  profilePhotoEl.src = user.avatar
    ? `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`
    : 'assets/images/avatar.jpg';

  await fillFavoriteRestaurant();
}

initProfile();

/* ---------------------------------------------------
   5. EDIT PROFILE MODAL
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
  if (e.target === editModal) {
    editModal.classList.add('hidden');
  }
});

/* ---------------------------------------------------
   6. SAVE PROFILE CHANGES
--------------------------------------------------- */

document.getElementById('save-profile').addEventListener('click', async () => {
  const updatedData = {
    username: document.getElementById('edit-username').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
  };

  const newPassword = document.getElementById('edit-password').value.trim();
  if (newPassword) updatedData.password = newPassword;

  console.log('Sending to API:', updatedData);

  const result = await updateUser(updatedData, token);

  if (result.data) {
    alert('Profile updated successfully');

    localStorage.setItem('user', JSON.stringify(result.data));

    document.getElementById('username').textContent = result.data.username;
    document.getElementById('email').textContent = result.data.email;

    editModal.classList.add('hidden');
  } else {
    alert(result.message || 'Update failed');
  }
});

/* ---------------------------------------------------
   7. DELETE ACCOUNT
--------------------------------------------------- */

deleteBtn.addEventListener('click', async () => {
  if (
    !confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
  ) {
    return;
  }

  const result = await deleteUser(token);

  if (result.data) {
    alert('Your account has been deleted.');
    localStorage.clear();
    window.location.href = 'index.html';
  } else {
    alert(result.message || 'Failed to delete account');
  }
});

/* ---------------------------------------------------
   8. UPLOAD AVATAR
--------------------------------------------------- */

uploadBtn.addEventListener('click', () => {
  avatarInput.click();
});

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const result = await uploadAvatar(file, token);
  console.log('Updated user:', result.data);

  if (result.data) {
    alert('Avatar updated successfully');

    profilePhotoEl.src = apiUrl + '/uploads/' + result.data.avatar;

    user.avatar = result.data.avatar;
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    alert(result.error || 'Failed to upload avatar');
  }
});
