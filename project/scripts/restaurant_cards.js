'use strict';
import fetchData from './fetch.js';
import Pagination from './pagination.js';
import {
  renderHeader,
  renderInfo,
  renderMenu,
  renderWeeklyMenu,
} from './modal.js';

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// Fetch all restaurants
const getRestaurants = async () => {
  try {
    return await fetchData(apiUrl + '/restaurants');
  } catch (error) {
    console.error(error);
  }
};

// Fetch daily menu
const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(apiUrl + `/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
};

// Fetch weekly menu
const getWeeklyMenu = async (id, lang) => {
  try {
    return await fetchData(apiUrl + `/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
};

// Function to render restaurant cards for the pagination
function renderCards(items) {
  const container = document.querySelector('#restaurant-list');
  container.innerHTML = '';

  const restaurantModal = document.getElementById('restaurant-modal');
  const closeRestaurant = document.querySelector('.close-restaurant');

  items.forEach((restaurant) => {
    const rDiv = document.createElement('div');
    rDiv.classList.add('restaurant-card');

    const rName = document.createElement('h3');
    rName.textContent = restaurant.name;

    const rAddress = document.createElement('p');
    rAddress.textContent = `${restaurant.address}, ${restaurant.city}`;

    rDiv.appendChild(rName);
    rDiv.appendChild(rAddress);

    rDiv.addEventListener('click', async () => {
      const modalWrapper = document.getElementById('restaurant-modal');
      const modalContent = document.querySelector('.restaurant-modal');

      // Clear previous content
      modalContent.innerHTML = '';

      // Close button (always on top right)
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

      // Container for buttons
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

        if (
          !dailyMenu ||
          !dailyMenu.courses ||
          dailyMenu.courses.length === 0
        ) {
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

      // Show modal after content is ready
      modalWrapper.classList.remove('hidden');
    });

    container.appendChild(rDiv);
  });

  restaurantModal.addEventListener('click', (e) => {
    if (e.target === restaurantModal) {
      restaurantModal.classList.add('hidden');
    }
  });
}

// Adaptive card count based on screen width
function getCardsPerPage() {
  const w = window.innerWidth;

  if (w >= 1200) return 9; // Desktop
  if (w >= 768) return 6; // Tablet landscape
  if (w >= 600) return 4; // Tablet portrait
  return 2; // Mobile
}

// Main function to show restaurants with pagination
const showRestaurants = async () => {
  const restaurants = await getRestaurants();

  restaurants.sort((a, b) => a.name.localeCompare(b.name));

  // Start pagination with the fetched restaurants and rendering function
  new Pagination(restaurants, renderCards, {
    getPerPage: getCardsPerPage,
  });
};

export default showRestaurants;
