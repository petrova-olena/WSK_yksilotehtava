'use strict';
import fetchData from './fetch.js';
import Pagination from './pagination.js';
import {
  renderHeader,
  renderInfo,
  renderMenu,
  renderWeeklyMenu,
} from './modal.js';
import {map} from './map.js';
import {clearFilterForm, applyFilters} from './filter.js';
import {getFavoriteRestaurant, setFavoriteRestaurant} from './favorite.js';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';
const markers = new Map(); // id → marker
let restaurants = [];
let currentFavorite = getFavoriteRestaurant();

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

  const restaurantModal = document.getElementById('restaurant-modal');

  items.forEach((restaurant) => {
    const rDiv = document.createElement('div');
    rDiv.classList.add('restaurant-card');
    rDiv.dataset.id = restaurant._id;

    const headerRow = document.createElement('div');
    headerRow.classList.add('restaurant-header-row');

    const rName = document.createElement('h3');
    rName.textContent = restaurant.name;

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

    headerRow.appendChild(rName);
    headerRow.appendChild(favBtn);
    rDiv.appendChild(headerRow);

    const rAddress = document.createElement('p');
    rAddress.textContent = `${restaurant.address}, ${restaurant.city}`;

    rDiv.appendChild(rName);
    rDiv.appendChild(rAddress);

    // Click on card = open modal
    rDiv.addEventListener('click', () => {
      openRestaurantModal(restaurant);
      highlightCard(restaurant._id);
    });

    container.appendChild(rDiv);
  });

  restaurantModal.addEventListener('click', (e) => {
    if (e.target === restaurantModal) {
      restaurantModal.classList.add('hidden');
    }
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

  // сортировка
  restaurants.sort((a, b) => a.name.localeCompare(b.name));

  // маркеры
  createMarkers(restaurants);

  // стартовый список
  new Pagination(restaurants, renderCards, {
    getPerPage: getCardsPerPage,
  });

  const applyBtn = document.querySelector('.apply-btn');
  const clearBtn = document.querySelector('.clear-btn');
  const filterModal = document.getElementById('filter-modal');
  const loadingModal = document.getElementById('loading-modal');

  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      // закрываем фильтр
      filterModal.classList.add('hidden');
      // показываем загрузку
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

        new Pagination(filtered, (items) => renderCards(items, favoritesList), {
          getPerPage: getCardsPerPage,
        });
      } catch (err) {
        console.error('Filter failed:', err);
      }

      // скрываем загрузку
      loadingModal.classList.add('hidden');
      // очищаем форму
      clearFilterForm();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearFilterForm();

      new Pagination(
        restaurants,
        (items) => renderCards(items, favoritesList),
        {
          getPerPage: getCardsPerPage,
        }
      );
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
