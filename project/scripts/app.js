'use strict';
import showRestaurants from './restaurant_cards.js';
import {initLoginModal} from './login.js';
import {initFilterModal} from './filter.js';

// Go to profile page when profile button is clicked
const goProfileBtn = document.getElementById('go-profile');

// Check if the button exists before adding event listener
if (goProfileBtn) {
  goProfileBtn.addEventListener('click', () => {
    const token = localStorage.getItem('token');

    if (token) {
      window.location.href = 'profile.html';
    } else {
      alert('Please log in to view your profile');
    }
  });
}

// Initialize the map and modals when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add map to the html with center in Helsinki
  mapInit();

  // Search restaurant modal filter window
  initFilterModal();

  // Login modal filter window
  initLoginModal();
  // Add restaurant cards to the page
  showRestaurants();
});
