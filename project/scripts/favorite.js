'use strict';

import {getUser, saveUser, updateUserOnServer} from './user.js';

export function getFavoriteRestaurant() {
  return getUser()?.favouriteRestaurant || null;
}

export async function setFavoriteRestaurant(id) {
  const user = getUser();
  if (!user) return;

  user.favouriteRestaurant = id;
  saveUser(user);

  await updateUserOnServer({favouriteRestaurant: id});
}

export function getFavoriteRestaurantName(restaurants) {
  const user = getUser();
  if (!user?.favouriteRestaurant) return null;

  const fav = restaurants.find((r) => r._id === user.favouriteRestaurant);
  return fav ? fav.name : null;
}
