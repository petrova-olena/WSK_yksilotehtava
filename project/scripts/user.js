'use strict';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// Function to get user data from localStorage, returns null if not found or on error
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

// Function to save user data to localStorage
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Function to get auth token from localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Function to save auth token to localStorage
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Function to check if user is authenticated, redirects to login if not
export function requireAuth() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

// Function to update user data on the server, returns server response or error
export async function updateUserOnServer(data) {
  const token = getToken();
  if (!token) return {error: 'Not authenticated'};

  // Validate input data
  try {
    const res = await fetch(`${apiUrl}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.data) saveUser(result.data);

    return result;
  } catch {
    return {error: 'Server error'};
  }
}

// Function to delete user account on the server, returns server response or error
export async function deleteUserOnServer() {
  const token = getToken();
  if (!token) return {error: 'Not authenticated'};

  // Confirm deletion with the user
  try {
    const res = await fetch(`${apiUrl}/users`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });

    return await res.json();
  } catch {
    return {error: 'Server error'};
  }
}

// Function to upload avatar image to the server, returns server response or error
export async function uploadAvatarToServer(file) {
  const token = getToken();
  if (!token) return {error: 'Not authenticated'};

  // Validate file input
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const res = await fetch(`${apiUrl}/users/avatar`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`},
      body: formData,
    });

    const result = await res.json();

    if (result.data) {
      const user = getUser();
      user.avatar = result.data.avatar;
      saveUser(user);
    }

    return result;
  } catch {
    return {error: 'Server error'};
  }
}
