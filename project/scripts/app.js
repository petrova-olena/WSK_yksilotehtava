'use strict';
import showRestaurants from './restaurant_cards.js';
import {initLoginModal} from './login.js';

// Add map to the html with center in Helsinki
var map = L.map('map').setView([60.22, 24.9], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

showRestaurants();

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

// Login modal filter window
document.addEventListener('DOMContentLoaded', () => {
  initLoginModal();
});
