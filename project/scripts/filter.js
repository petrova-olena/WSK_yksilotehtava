'use strict';
import {getDailyMenu, getWeeklyMenu} from './restaurant_cards.js';

// Handles filter modal UI and logic
export function initFilterModal() {
  const filterBtn = document.querySelector('.search-btn');
  const filterModal = document.getElementById('filter-modal');
  const closeFilter = document.querySelector('.close-modal');

  // Open modal
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      filterModal.classList.remove('hidden');
    });
  }

  // Close modal on close button
  if (closeFilter) {
    closeFilter.addEventListener('click', () => {
      filterModal.classList.add('hidden');
    });
  }

  // Close modal on outside click
  if (filterModal) {
    filterModal.addEventListener('click', (e) => {
      if (e.target === filterModal) {
        filterModal.classList.add('hidden');
      }
    });
  }
}

// Get current filter values from the form
export function getFilters() {
  return {
    address: document.getElementById('filter-address').value,
    keyword: document.getElementById('filter-keyword').value,
    diets: [...document.querySelectorAll('.diet-options input:checked')].map(
      (cb) => cb.value.toLowerCase()
    ),
    useLocation:
      document.getElementById('use-location').checked && window.userLocation,
    userLocation: window.userLocation || null,
  };
}

// Clear all filter inputs
export function clearFilterForm() {
  document.getElementById('filter-address').value = '';
  document.getElementById('filter-keyword').value = '';
  document.getElementById('use-location').checked = false;
  document
    .querySelectorAll('.diet-options input')
    .forEach((cb) => (cb.checked = false));
}

// Apply basic filters (address, location sorting) to the restaurant list
function filterRestaurants(restaurants, filters) {
  let results = [...restaurants];

  // Normalize address filter for case-insensitive matching
  const addr = filters.address.trim().toLowerCase();

  // Address / name / city filter (case-insensitive, partial match)
  if (addr) {
    results = results.filter(
      (r) =>
        r.address.toLowerCase().includes(addr) ||
        r.city.toLowerCase().includes(addr) ||
        r.name.toLowerCase().includes(addr)
    );
  }

  // Location sorting (but NOT exclusive — other filters still apply)
  if (filters.useLocation && filters.userLocation) {
    const {lat, lng} = filters.userLocation;

    // Sort by distance from user location
    results.sort((a, b) => {
      const distA = distance(
        lat,
        lng,
        a.location.coordinates[1],
        a.location.coordinates[0]
      );
      const distB = distance(
        lat,
        lng,
        b.location.coordinates[1],
        b.location.coordinates[0]
      );
      return distA - distB;
    });
  } else {
    // Default alphabetical sorting
    results.sort((a, b) => a.name.localeCompare(b.name));
  }
  return results;
}

// Haversine formula to calculate distance between two lat/lng points in km
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Filter restaurants by menu keyword and diets
async function filterByMenu(restaurants, keyword, diets) {
  const results = [];

  // Normalize keyword and diets for consistent matching
  const key = keyword?.trim().toLowerCase() || '';
  // Ensure diets is an array of lowercase strings
  const dietList = diets || [];

  // For each restaurant, fetch daily and weekly menus, combine courses, and apply filters
  for (const r of restaurants) {
    let daily = {};
    let weekly = {};

    try {
      daily = (await getDailyMenu(r._id, 'en')) || {};
    } catch {}

    try {
      weekly = (await getWeeklyMenu(r._id, 'en')) || {};
    } catch {}

    const dailyCourses = Array.isArray(daily.courses) ? daily.courses : [];

    const weeklyCourses = Array.isArray(weekly.days)
      ? weekly.days.flatMap((day) =>
          Array.isArray(day.courses) ? day.courses : []
        )
      : [];

    const allCourses = [...dailyCourses, ...weeklyCourses];

    // If no keyword/diets → restaurant stays, even if menu is empty
    if (!key && dietList.length === 0) {
      results.push(r);
      continue;
    }

    // If menu empty → skip (unless no filters, handled above)
    if (allCourses.length === 0) continue;

    // Keyword match (name, desc, price) - case-insensitive, partial
    const keywordMatch = key
      ? allCourses.some((course) => {
          const name = course.name?.toLowerCase() || '';
          const desc = course.description?.toLowerCase() || '';
          const price = (course.price + '').toLowerCase();
          return (
            name.includes(key) || desc.includes(key) || price.includes(key)
          );
        })
      : true;

    // Strict diet match (all selected diets must be in at least one course)
    const dietMatch = dietList.length
      ? dietList.every((diet) =>
          allCourses.some((course) => {
            const courseDiets = normalizeDiets(course.diets);
            return courseDiets.includes(diet);
          })
        )
      : true;

    if (keywordMatch && dietMatch) {
      results.push(r);
    }
  }

  return results;
}

// Normalize diets field to an array of lowercase strings for consistent matching
function normalizeDiets(diets) {
  if (!diets) return [];

  if (Array.isArray(diets)) {
    return diets
      .map((d) => (d || '').toString().trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof diets === 'string') {
    return diets
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

// Main function to apply all filters to the restaurant list
export async function applyFilters(restaurants, filters) {
  // Basic filters (address, location sorting)
  let filtered = filterRestaurants(restaurants, filters);

  // Menu filters (keyword + diets)
  if (filters.keyword || filters.diets.length > 0) {
    const menuFiltered = await filterByMenu(
      restaurants,
      filters.keyword,
      filters.diets
    );

    // Intersection
    filtered = filtered.filter((r) =>
      menuFiltered.some((m) => m._id === r._id)
    );
  }

  return filtered;
}
