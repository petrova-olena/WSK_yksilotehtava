'use strict';

import {getUser, saveUser, updateUserOnServer} from './user.js';

// Favorite restaurant management
export function getFavoriteRestaurant() {
  return getUser()?.favouriteRestaurant || null;
}

// Set the user's favorite restaurant and update it on the server
export async function setFavoriteRestaurant(id) {
  const user = getUser();
  if (!user) return;

  user.favouriteRestaurant = id;
  saveUser(user);

  // Update the user's favorite restaurant on the server
  await updateUserOnServer({favouriteRestaurant: id});
}

// Get the name of the user's favorite restaurant from the list of restaurants
export function getFavoriteRestaurantName(restaurants) {
  const user = getUser();
  if (!user?.favouriteRestaurant) return null;

  const fav = restaurants.find((r) => r._id === user.favouriteRestaurant);
  return fav ? fav.name : null;
}
