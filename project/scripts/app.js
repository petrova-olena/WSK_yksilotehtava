'use strict';
import {mapInit} from './map.js';
import showRestaurants from './restaurant_cards.js';
import {initLoginModal} from './login.js';
import {initFilterModal} from './filter.js';

// Add map to the html with center in Helsinki
mapInit();

// Search restaurant modal filter window
initFilterModal();

// Login modal filter window
document.addEventListener('DOMContentLoaded', () => {
  initLoginModal();
  // Add restaurant cards to the page
  showRestaurants();
});
