'use strict';

export default async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error.message);
    // Throw error to the next function
    throw error;
  }
}
