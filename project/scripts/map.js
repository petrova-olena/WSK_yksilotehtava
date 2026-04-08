'use strict';

const map = L.map('map').setView([60.22, 24.9], 11);

const mapInit = () => {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const userIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const userMarker = L.marker(map.getCenter(), {icon: userIcon}).addTo(map);
  userMarker._icon.classList.add('user-marker');

  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    window.userLocation = {lat, lng};

    userMarker.setLatLng([lat, lng]);
    map.setView([lat, lng], 14);
  });
};
