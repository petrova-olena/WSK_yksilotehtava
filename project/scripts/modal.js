'use strict';

// Functions to render restaurant details and menus in a modal
export function renderHeader(restaurant) {
  const h3 = document.createElement('h3');
  h3.textContent = restaurant.name;
  return h3;
}

// Renders restaurant info: address, phone, company
export function renderInfo(restaurant) {
  const div = document.createElement('div');
  div.innerHTML = `
    <p>${restaurant.address}, ${restaurant.postalCode}, ${restaurant.city}</p>
    <p>phone: ${restaurant.phone}</p>
    <p>company: ${restaurant.company}</p>
  `;
  return div;
}

// Renders daily menu with courses, prices, and diets
export function renderMenu(dailyMenu) {
  const div = document.createElement('div');
  div.classList.add('menu-container');

  if (!dailyMenu || !Array.isArray(dailyMenu.courses)) {
    div.textContent = 'No menu available today.';
    return div;
  }

  // Loop through courses and create cards for each
  dailyMenu.courses.forEach((course) => {
    const card = document.createElement('div');
    card.className = 'course-card';

    // Handle diets as either string or array
    const diets =
      typeof course.diets === 'string'
        ? course.diets.split(',').map((d) => d.trim())
        : Array.isArray(course.diets)
          ? course.diets
          : [];

    card.innerHTML = `
      <h4>${course.name}</h4>
      <p class="course-price">${course.price}</p>
      <div class="course-diets">
        ${
          diets.length
            ? diets.map((d) => `<span class="diet-tag">${d}</span>`).join('')
            : '<span class="diet-none">No diet info</span>'
        }
      </div>
    `;

    div.appendChild(card);
  });

  return div;
}

// Renders weekly menu with days, courses, prices, and diets
export function renderWeeklyMenu(weeklyMenu) {
  const container = document.createElement('div');
  container.classList.add('menu-container');

  // If no menu or empty days array
  if (
    !weeklyMenu ||
    !Array.isArray(weeklyMenu.days) ||
    weeklyMenu.days.length === 0
  ) {
    container.textContent = 'No weekly menu available.';
    return container;
  }

  // Loop through each day and render its courses
  weeklyMenu.days.forEach((day) => {
    // Day header
    const dayHeader = document.createElement('h4');
    dayHeader.textContent = new Date(day.date).toLocaleDateString('en-FI', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    dayHeader.style.marginTop = '10px';
    dayHeader.style.color = '#5d1208';
    dayHeader.style.fontWeight = '700';
    container.appendChild(dayHeader);

    // If no courses available
    if (!day.courses || day.courses.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No menu for this day.';
      empty.classList.add('diet-none');
      container.appendChild(empty);
      return;
    }

    // Courses
    day.courses.forEach((course) => {
      const card = document.createElement('div');
      card.className = 'course-card';

      const diets =
        typeof course.diets === 'string'
          ? course.diets.split(',').map((d) => d.trim())
          : Array.isArray(course.diets)
            ? course.diets
            : [];

      card.innerHTML = `
        <h4>${course.name}</h4>
        <p class="course-price">${course.price}</p>
        <div class="course-diets">
          ${
            diets.length
              ? diets.map((d) => `<span class="diet-tag">${d}</span>`).join('')
              : '<span class="diet-none">No diet info</span>'
          }
        </div>
      `;

      container.appendChild(card);
    });
  });

  return container;
}
