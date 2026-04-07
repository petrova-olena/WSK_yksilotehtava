'use strict';

export function initFilterModal() {
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
}

export function getFilters() {
  return {
    address: document.getElementById('filter-address').value,
    keyword: document.getElementById('filter-keyword').value,
    diets: [...document.querySelectorAll('.diet-options input:checked')].map(
      (cb) => cb.parentElement.textContent.trim().toLowerCase()
    ),
    useLocation: document.getElementById('use-location').checked,
    userLocation: window.userLocation || null,
  };
}

export function clearFilterForm() {
  document.getElementById('filter-address').value = '';
  document.getElementById('filter-keyword').value = '';
  document.getElementById('use-location').checked = false;
  document
    .querySelectorAll('.diet-options input')
    .forEach((cb) => (cb.checked = false));
}

export function filterRestaurants(restaurants, filters) {
  let results = [...restaurants];

  const addr = filters.address.trim().toLowerCase();
  const key = filters.keyword.trim().toLowerCase();

  if (key) {
    results = results.filter(
      (r) =>
        r._id.toLowerCase().includes(key) || r.name.toLowerCase().includes(key)
    );
  }

  if (addr) {
    results = results.filter(
      (r) =>
        r.address.toLowerCase().includes(addr) ||
        r.city.toLowerCase().includes(addr)
    );
  }

  if (filters.diets.length > 0) {
    results = results.filter(
      (r) =>
        r.diets &&
        filters.diets.some((d) =>
          r.diets.map((x) => x.toLowerCase()).includes(d)
        )
    );
  }

  if (filters.useLocation && filters.userLocation) {
    const {lat, lng} = filters.userLocation;

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

    return results;
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

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
