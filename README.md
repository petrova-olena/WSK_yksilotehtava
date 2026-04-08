# Student Restaurants Finder

A web application that displays Finnish student restaurants and their daily and weekly menus.  
Built as a course project using the provided REST API.

## Features

- List of student restaurants with clear card layout
- Interactive map with restaurant markers (Leaflet)
- Daily and weekly menus for each restaurant
- Filtering options:
  - address / city text search
  - keyword search (dish name, description, price)
  - dietary filters
  - sort by user location (nearest restaurant first)
- User authentication (registration & login)
- User profile:
  - update username, email, password
  - upload profile picture
  - choose a favourite restaurant
  - delete account
- Responsive layout for desktop, tablet, and mobile

## Technologies Used

- HTML5
- CSS3 (no frameworks)
- Vanilla JavaScript (ES6 modules)
- Leaflet.js for map rendering
- REST API: `https://media2.edu.metropolia.fi/restaurant/api/v1`

## Project Structure

### HTML & CSS

- `index.html` — main page with map and restaurant list
- `profile.html` — user profile page
- `style.css` — application styling

### JavaScript Modules (`/scripts`)

- `app.js` — main application logic
- `map.js` — map initialization and markers
- `restaurant_cards.js` — restaurant and menu loading
- `filter.js` — filtering and sorting logic
- `pagination.js` — pagination controls
- `modal.js` — modal window handling
- `login.js` — login and registration modal logic
- `user.js` — authentication and user API functions
- `profile.js` — profile page logic
- `favorite.js` — favourite restaurant selection
- `fetch.js` — helper functions for API requests

## Running

The application is deployed and can be accessed via its public URL:
https://users.metropolia.fi/~olenape/WSK_yksilotehtava/

## Notes

- Some features (e.g., geolocation) require browser permissions.
- The project is intended for educational use and does not include advanced optimization.
