// Add map to the html with center in Helsinki
var map = L.map('map').setView([60.22, 24.9], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Minumum for the clicking on restaurant card
const restaurantModal = document.getElementById('restaurant-modal');
const closeRestaurant = document.querySelector('.close-restaurant');

document.querySelectorAll('.restaurant-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.getElementById('restaurant-name').textContent = 'Restaurant';
    document.getElementById('restaurant-address').textContent =
      'Address, postal code, city';
    document.getElementById('restaurant-phone').textContent =
      'Phone: +358-00-000-00-00';
    document.getElementById('restaurant-company').textContent =
      'Company: company';

    restaurantModal.classList.remove('hidden');
  });
});

closeRestaurant.addEventListener('click', () => {
  restaurantModal.classList.add('hidden');
});

restaurantModal.addEventListener('click', (e) => {
  if (e.target === restaurantModal) {
    restaurantModal.classList.add('hidden');
  }
});

// Minumum for the search restaurant modal filter window
const filterBtn = document.querySelector('.search-btn');
const filterModal = document.getElementById('filter-modal');
const closeFilter = document.querySelector('.close-modal');

if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    filterModal.classList.remove('hidden');
  });
}

if (closeFilter) {
  closeFilter.addEventListener('click', () => {
    filterModal.classList.add('hidden');
  });
}

if (filterModal) {
  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) {
      filterModal.classList.add('hidden');
    }
  });
}

// Minumum for the login modal filter window
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLogin = document.querySelector('.close-login');

if (loginBtn && loginModal) {
  loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
  });
}

if (closeLogin && loginModal) {
  closeLogin.addEventListener('click', () => {
    loginModal.classList.add('hidden');
  });
}

if (loginModal) {
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.add('hidden');
    }
  });
}
