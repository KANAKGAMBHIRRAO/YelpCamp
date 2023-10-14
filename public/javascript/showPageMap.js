mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/streets-v12",
  center: campground.geometry.coordinates,
  zoom: 4,
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .addTo(map)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  );

// Create a default Marker, colored black, rotated 45 degrees.
const marker2 = new mapboxgl.Marker({ color: "black", rotation: 45 })
  .setLngLat(campground.geometry.coordinates)
  .addTo(map);

map.addControl(new mapboxgl.NavigationControl());
