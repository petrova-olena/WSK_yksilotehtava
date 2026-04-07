'use strict';

export default async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {};
    }

    return await response.json();
  } catch (error) {
    return {};
  }
}
