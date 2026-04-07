'use strict';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

export function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('token');
}

export async function updateUserOnServer(data) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${apiUrl}/users`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) return null;

  const result = await res.json();
  saveUser(result.data);
  return result.data;
}
