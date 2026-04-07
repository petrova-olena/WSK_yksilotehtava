'use strict';

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

const firstNameEl = document.getElementById('first-name');
const lastNameEl = document.getElementById('last-name');
const emailEl = document.getElementById('email');
const profilePhotoEl = document.getElementById('profile-photo');
const favoritesListEl = document.getElementById('favorites-list');
const favoritesEmptyEl = document.getElementById('favorites-empty');

const editBtn = document.querySelector('.edit-profile-btn');
const editModal = document.getElementById('edit-modal');
const deleteBtn = document.querySelector('.delete-profile-btn');
const uploadBtn = document.querySelector('.upload-photo-btn');
const avatarInput = document.getElementById('avatar-input');

/* ---------------------------------------------------
   4. INITIAL PROFILE FILL
--------------------------------------------------- */

emailEl.textContent = user.email || '—';
firstNameEl.textContent = user.firstName || '—';
lastNameEl.textContent = user.lastName || '—';

if (user.avatar) {
  profilePhotoEl.src = apiUrl + '/uploads/' + user.avatar;
}

if (user.favouriteRestaurant) {
  favoritesEmptyEl.style.display = 'none';
  const li = document.createElement('li');
  li.textContent = user.favouriteRestaurant;
  favoritesListEl.appendChild(li);
}

/* ---------------------------------------------------
   5. EDIT PROFILE MODAL
--------------------------------------------------- */

editBtn.addEventListener('click', () => {
  document.getElementById('edit-email').value = user.email || '';
  document.getElementById('edit-username').value = user.username || '';
  document.getElementById('edit-password').value = '';
  editModal.classList.remove('hidden');
});

document.querySelector('.close-edit').addEventListener('click', () => {
  editModal.classList.add('hidden');
});

/* ---------------------------------------------------
   6. SAVE PROFILE CHANGES
--------------------------------------------------- */

document.getElementById('save-profile').addEventListener('click', async () => {
  const updatedData = {
    email: document.getElementById('edit-email').value.trim(),
    username: document.getElementById('edit-username').value.trim(),
  };

  const newPassword = document.getElementById('edit-password').value.trim();
  if (newPassword) updatedData.password = newPassword;

  const result = await updateUser(updatedData, token);

  if (result.data) {
    alert('Profile updated successfully');

    // Update localStorage
    localStorage.setItem('user', JSON.stringify(result.data));

    // Update UI
    emailEl.textContent = result.data.email;
    firstNameEl.textContent = result.data.firstName || '—';
    lastNameEl.textContent = result.data.lastName || '—';

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

  if (result.data) {
    alert('Avatar updated successfully');

    profilePhotoEl.src = apiUrl + '/uploads/' + result.data.avatar;

    user.avatar = result.data.avatar;
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    alert(result.error || 'Failed to upload avatar');
  }
});
