'use strict';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// Function to log in a user. Returns {message: 'error'} on failure and {token, data: user} on success.
async function loginUser(username, password) {
  try {
    const response = await fetch(apiUrl + '/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password}),
    });

    if (!response.ok) return {message: 'Login failed'};
    return await response.json();
  } catch {
    return {message: 'Server error'};
  }
}

// Function to register a new user. Returns {message: 'error'} on failure and {data: user} on success.
async function registerUser(username, email, password) {
  try {
    const response = await fetch(apiUrl + '/users', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password, email}),
    });

    if (!response.ok) return {message: 'Registration failed'};
    return await response.json();
  } catch {
    return {message: 'Server error'};
  }
}

// Main part starts here.
let modalInitialized = false;

// Initializes the login modal and its event listeners. This function should be called once on page load.
export function initLoginModal() {
  if (modalInitialized) return; // prevent double init
  modalInitialized = true;

  // Get DOM elements
  const loginBtn = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  const loginContent = document.querySelector('.login-modal');

  if (!loginBtn || !loginModal || !loginContent) return;

  // Open modal
  loginBtn.addEventListener('click', () => openLoginView());

  // Backdrop close (added ONCE)
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
  });

  // Renders the login form inside the modal. Also sets up event listeners
  // for switching to registration and submitting the login form.
  function openLoginView() {
    loginContent.innerHTML = '';

    // Create form elements
    addCloseButton();
    addTitle('Login');

    // Create username and password fields
    const username = addInput('Username', 'login-username', 'text');
    const password = addInput('Password', 'login-password', 'password');

    // Create submit button
    const submitBtn = addSubmitButton('Login');

    // Create switcher to registration view
    const switcher = document.createElement('p');
    switcher.classList.add('create-account');
    switcher.innerHTML = `Don't have an account? <a href="#" class="open-register">Create one</a>`;
    loginContent.appendChild(switcher);

    switcher.querySelector('.open-register').addEventListener('click', (e) => {
      e.preventDefault();
      openRegisterView();
    });

    // Handle login submission
    submitBtn.addEventListener('click', async () => {
      const user = username.value.trim();
      const pass = password.value.trim();

      if (!user || !pass) {
        alert('Please fill in both fields');
        return;
      }

      // Disable button to prevent multiple clicks
      submitBtn.disabled = true;
      const result = await loginUser(user, pass);
      submitBtn.disabled = false;

      // On successful login, store token and user data, then close modal. On failure, show error message.
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.data));

        alert('Login successful');
        loginModal.classList.add('hidden');
      } else {
        alert(result.message || 'Login failed');
      }
    });

    loginModal.classList.remove('hidden');
  }

  // Renders the registration form inside the modal. Also sets up event listeners
  // for switching to login and submitting the registration form.
  function openRegisterView() {
    loginContent.innerHTML = '';

    // Create form elements
    addCloseButton();
    addTitle('Create Account');

    // Create username, email, and password fields
    const username = addInput('Username', 'register-username', 'text');
    const email = addInput('Email', 'register-email', 'email');
    const password = addInput('Password', 'register-password', 'password');

    // Create submit button
    const submitBtn = addSubmitButton('Register');

    // Create switcher to login view
    const switcher = document.createElement('p');
    switcher.classList.add('create-account');
    switcher.innerHTML = `Already have an account? <a href="#" class="open-login">Login</a>`;
    loginContent.appendChild(switcher);

    switcher.querySelector('.open-login').addEventListener('click', (e) => {
      e.preventDefault();
      openLoginView();
    });

    // Handle registration submission
    submitBtn.addEventListener('click', async () => {
      const user = username.value.trim();
      const mail = email.value.trim();
      const pass = password.value.trim();

      if (!user || !mail || !pass) {
        alert('Please fill in all fields');
        return;
      }

      // Disable button to prevent multiple clicks
      submitBtn.disabled = true;
      const result = await registerUser(user, mail, pass);
      submitBtn.disabled = false;

      if (result.data) {
        alert('Registration successful! Please log in.');
        openLoginView();
      } else {
        alert(result.message || 'Registration failed');
      }
    });

    loginModal.classList.remove('hidden');
  }

  // Helper function to create a close button and append it to the login content.
  // The button will close the modal when clicked.
  function addCloseButton() {
    const btn = document.createElement('button');
    btn.classList.add('close-login');
    btn.textContent = 'x';
    btn.addEventListener('click', () => loginModal.classList.add('hidden'));
    loginContent.appendChild(btn);
  }

  // Helper function to create a title element and append it to the login content.
  function addTitle(text) {
    const title = document.createElement('h2');
    title.textContent = text;
    loginContent.appendChild(title);
  }

  // Helper function to create a labeled input field and append it to the login content.
  function addInput(labelText, id, type) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    loginContent.appendChild(label);

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    loginContent.appendChild(input);

    return input;
  }

  // Helper function to create a submit button and append it to the login content.
  function addSubmitButton(text) {
    const btn = document.createElement('button');
    btn.classList.add('login-submit');
    btn.textContent = text;
    loginContent.appendChild(btn);
    return btn;
  }
}
