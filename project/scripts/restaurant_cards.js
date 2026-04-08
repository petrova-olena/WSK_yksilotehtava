'use strict';
import fetchData from './fetch.js';
import Pagination from './pagination.js';
import {
  renderHeader,
  renderInfo,
  renderMenu,
  renderWeeklyMenu,
} from './modal.js';
import {clearFilterForm, applyFilters} from './filter.js';
import {getFavoriteRestaurant, setFavoriteRestaurant} from './favorite.js';

// Global variables
const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';
const markers = new Map(); // id → marker
let restaurants = [];
let currentFavorite = getFavoriteRestaurant();

// Function to initialize modal close behavior
function initRestaurantModalClose() {
  const restaurantModal = document.getElementById('restaurant-modal');
  if (!restaurantModal) return;

  restaurantModal.addEventListener('click', (e) => {
    if (e.target === restaurantModal) {
      restaurantModal.classList.add('hidden');
    }
  });
}

// Fetch all restaurants
export const getRestaurants = async () => {
  try {
    return await fetchData(apiUrl + '/restaurants');
  } catch (error) {
    console.error(error);
  }
};

// Fetch daily menu
export const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(apiUrl + `/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
    return {};
  }
};

// Fetch weekly menu
export const getWeeklyMenu = async (id, lang) => {
  try {
    return await fetchData(apiUrl + `/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error(error);
    return {};
  }
};

// Function to open restaurant modal with details and menu
async function openRestaurantModal(restaurant) {
  const modalWrapper = document.getElementById('restaurant-modal');
  const modalContent = document.querySelector('.restaurant-modal');

  modalContent.innerHTML = '';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-restaurant');
  closeBtn.textContent = 'X';
  closeBtn.addEventListener('click', () => {
    modalWrapper.classList.add('hidden');
  });
  modalContent.appendChild(closeBtn);

  // Header + info
  modalContent.appendChild(renderHeader(restaurant));
  modalContent.appendChild(renderInfo(restaurant));

  // Buttons container
  const btnContainer = document.createElement('div');
  btnContainer.classList.add('restaurant-buttons');

  const dailyBtn = document.createElement('button');
  dailyBtn.classList.add('menu-day');
  dailyBtn.textContent = 'Menu for Today';

  const weeklyBtn = document.createElement('button');
  weeklyBtn.classList.add('menu-week');
  weeklyBtn.textContent = 'Menu for Week';

  btnContainer.appendChild(dailyBtn);
  btnContainer.appendChild(weeklyBtn);
  modalContent.appendChild(btnContainer);

  // Menu container
  const menuContainer = document.createElement('div');
  menuContainer.classList.add('menu-output');
  modalContent.appendChild(menuContainer);

  // Daily menu
  dailyBtn.addEventListener('click', async () => {
    const dailyMenu = await getDailyMenu(restaurant._id, 'en');
    menuContainer.innerHTML = '';

    if (!dailyMenu || !dailyMenu.courses || dailyMenu.courses.length === 0) {
      menuContainer.textContent = 'No menu available today.';
      return;
    }

    menuContainer.appendChild(renderMenu(dailyMenu));
  });

  // Weekly menu
  weeklyBtn.addEventListener('click', async () => {
    const weeklyMenu = await getWeeklyMenu(restaurant._id, 'en');
    menuContainer.innerHTML = '';
    menuContainer.appendChild(renderWeeklyMenu(weeklyMenu));
  });

  modalWrapper.classList.remove('hidden');
}

// Function to render restaurant cards (only cards, without markers)
function renderCards(items) {
  const container = document.querySelector('#restaurant-list');
  container.innerHTML = '';

  // Create cards
  items.forEach((restaurant) => {
    const rDiv = document.createElement('div');
    rDiv.classList.add('restaurant-card');
    rDiv.dataset.id = restaurant._id;

    // Favorite button
    const favBtn = document.createElement('button');
    favBtn.classList.add('favorite-btn');

    const updateStar = () => {
      favBtn.textContent = restaurant._id === currentFavorite ? '★' : '☆';
    };
    updateStar();

    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      currentFavorite = restaurant._id;
      await setFavoriteRestaurant(currentFavorite);

      document
        .querySelectorAll('.favorite-btn')
        .forEach((btn) => (btn.textContent = '☆'));

      updateStar();
    });

    rDiv.appendChild(favBtn);

    // Restaurant name and address
    const rName = document.createElement('h3');
    rName.textContent = restaurant.name;
    rDiv.appendChild(rName);

    const rAddress = document.createElement('p');
    rAddress.textContent = `${restaurant.address}, ${restaurant.city}`;
    rDiv.appendChild(rAddress);

    // Click on card = open modal
    rDiv.addEventListener('click', () => {
      openRestaurantModal(restaurant);
      highlightCard(restaurant._id);
    });

    container.appendChild(rDiv);
  });
}

// Function to highlight a restaurant card
function highlightCard(id) {
  document.querySelectorAll('.restaurant-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.id === id);
  });
}

// Create markers once for the given restaurant items
function createMarkers(items) {
  items.forEach((r) => {
    if (markers.has(r._id)) return;

    const marker = L.marker([
      r.location.coordinates[1],
      r.location.coordinates[0],
    ]).addTo(map);

    markers.set(r._id, marker);

    marker.on('click', () => {
      openRestaurantModal(r);
      highlightCard(r._id);
    });
  });
}

// Function to show restaurants (main function)
const showRestaurants = async () => {
  restaurants = await getRestaurants();

  // Sort restaurants alphabetically by name
  restaurants.sort((a, b) => a.name.localeCompare(b.name));

  initRestaurantModalClose();

  // Create markers
  createMarkers(restaurants);

  // Initialize pagination
  new Pagination(restaurants, renderCards, {
    getPerPage: getCardsPerPage,
  });

  // Filter button handlers
  const applyBtn = document.querySelector('.apply-btn');
  const clearBtn = document.querySelector('.clear-btn');
  const filterModal = document.getElementById('filter-modal');
  const loadingModal = document.getElementById('loading-modal');

  // Apply filters
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      // Close filter modal
      filterModal.classList.add('hidden');
      // Show loading
      loadingModal.classList.remove('hidden');

      try {
        const filters = {
          address: document.getElementById('filter-address').value,
          keyword: document.getElementById('filter-keyword').value,
          diets: [
            ...document.querySelectorAll('.diet-options input:checked'),
          ].map((cb) => cb.value.toLowerCase()),
          useLocation: document.getElementById('use-location').checked,
          userLocation: window.userLocation || null,
        };

        const filtered = await applyFilters(restaurants, filters);

        // Update markers
        new Pagination(filtered, (items) => renderCards(items), {
          getPerPage: getCardsPerPage,
        });
      } catch (err) {
        console.error('Filter failed:', err);
      }

      // Hide loading
      loadingModal.classList.add('hidden');
      // Clear filter form
      clearFilterForm();
    });
  }

  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearFilterForm();

      new Pagination(restaurants, (items) => renderCards(items), {
        getPerPage: getCardsPerPage,
      });
    });
  }
};

export default showRestaurants;

// Adaptive card count based on screen width
function getCardsPerPage() {
  const w = window.innerWidth;

  if (w >= 1200) return 9;
  if (w >= 768) return 6;
  if (w >= 600) return 4;
  return 2;
}
