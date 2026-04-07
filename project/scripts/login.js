'use strict';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

async function loginUser(username, password) {
  try {
    const response = await fetch(apiUrl + '/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password}),
    });

    const data = await response.json();

    return data; // { message, token, data }
  } catch (error) {
    console.error('Login error:', error);
    return {message: 'Server error'};
  }
}

async function registerUser(username, email, password) {
  try {
    const response = await fetch(apiUrl + '/users', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password, email}),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {message: 'Server error'};
  }
}

export function initLoginModal() {
  const loginBtn = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  const loginContent = document.querySelector('.login-modal');

  if (!loginBtn || !loginModal || !loginContent) return;

  loginBtn.addEventListener('click', () => {
    openLoginModal();
  });

  function openLoginModal() {
    loginContent.innerHTML = '';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-login');
    closeBtn.textContent = 'x';
    closeBtn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });
    loginContent.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Login';
    loginContent.appendChild(title);

    // Username
    const labelUser = document.createElement('label');
    labelUser.setAttribute('for', 'login-username');
    labelUser.textContent = 'Username';
    loginContent.appendChild(labelUser);

    const inputUser = document.createElement('input');
    inputUser.type = 'text';
    inputUser.id = 'login-username';
    inputUser.placeholder = 'Enter username';
    loginContent.appendChild(inputUser);

    // Password
    const labelPass = document.createElement('label');
    labelPass.setAttribute('for', 'login-password');
    labelPass.textContent = 'Password';
    loginContent.appendChild(labelPass);

    const inputPass = document.createElement('input');
    inputPass.type = 'password';
    inputPass.id = 'login-password';
    inputPass.placeholder = 'Enter password';
    loginContent.appendChild(inputPass);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.classList.add('login-submit');
    submitBtn.textContent = 'Login';
    loginContent.appendChild(submitBtn);

    // Create account link
    const createAcc = document.createElement('p');
    createAcc.classList.add('create-account');
    createAcc.innerHTML = `Don't have an account? <a href="#" class="open-register">Create one</a>`;
    loginContent.appendChild(createAcc);

    createAcc.querySelector('.open-register').addEventListener('click', (e) => {
      e.preventDefault();
      openRegisterView();
    });

    // Login handler
    submitBtn.addEventListener('click', async () => {
      const username = inputUser.value.trim();
      const password = inputPass.value.trim();

      if (!username || !password) {
        alert('Please fill in both fields');
        return;
      }

      const result = await loginUser(username, password);

      if (result.token) {
        // Save token
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.data));

        alert('Login successful');

        loginModal.classList.add('hidden');
      } else {
        alert(result.message || 'Login failed');
      }
    });

    // Show modal
    loginModal.classList.remove('hidden');
  }

  // Close on backdrop click
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.add('hidden');
      }
    });
  }

  function openRegisterView() {
    loginContent.innerHTML = '';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-login');
    closeBtn.textContent = 'x';
    closeBtn.addEventListener('click', () =>
      loginModal.classList.add('hidden')
    );
    loginContent.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Create Account';
    loginContent.appendChild(title);

    // Username
    const labelUser = document.createElement('label');
    labelUser.textContent = 'Username';
    loginContent.appendChild(labelUser);

    const inputUser = document.createElement('input');
    inputUser.type = 'text';
    inputUser.placeholder = 'Choose username';
    inputUser.id = 'register-username';
    loginContent.appendChild(inputUser);

    // Email
    const labelEmail = document.createElement('label');
    labelEmail.textContent = 'Email';
    loginContent.appendChild(labelEmail);

    const inputEmail = document.createElement('input');
    inputEmail.type = 'email';
    inputEmail.placeholder = 'Enter email';
    inputEmail.id = 'register-email';
    loginContent.appendChild(inputEmail);

    // Password
    const labelPass = document.createElement('label');
    labelPass.textContent = 'Password';
    loginContent.appendChild(labelPass);

    const inputPass = document.createElement('input');
    inputPass.type = 'password';
    inputPass.placeholder = 'Choose password';
    inputPass.id = 'register-password';
    loginContent.appendChild(inputPass);

    // Submit
    const submitBtn = document.createElement('button');
    submitBtn.classList.add('login-submit');
    submitBtn.textContent = 'Register';
    loginContent.appendChild(submitBtn);

    // Switch to login
    const backToLogin = document.createElement('p');
    backToLogin.classList.add('create-account');
    backToLogin.innerHTML = `Already have an account? <a href="#" class="open-login">Login</a>`;
    loginContent.appendChild(backToLogin);

    // Register handler
    submitBtn.addEventListener('click', async () => {
      const username = inputUser.value.trim();
      const email = inputEmail.value.trim();
      const password = inputPass.value.trim();

      if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
      }

      const result = await registerUser(username, email, password);

      if (result.data) {
        alert('Registration successful! Please log in to your account.');
        openLoginModal();
      } else {
        alert(result.message || 'Registration failed');
      }
    });

    // Switch back to login
    backToLogin.querySelector('.open-login').addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });

    loginModal.classList.remove('hidden');
  }
}
