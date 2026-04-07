'use strict';
import showRestaurants from './restaurant_cards.js';
import {initLoginModal} from './login.js';

// Add map to the html with center in Helsinki
export const map = L.map('map').setView([60.22, 24.9], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const userIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userMarker = L.marker(map.getCenter(), {icon: userIcon}).addTo(map);
userMarker._icon.classList.add('user-marker');

navigator.geolocation.getCurrentPosition((pos) => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  userMarker.setLatLng([lat, lng]);
  map.setView([lat, lng], 14);
});

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
