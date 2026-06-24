console.log("map loaded");

const mapDiv = document.getElementById("map");

const coordinates =
JSON.parse(mapDiv.dataset.coordinates);

const map = L.map("map").setView(
    [coordinates[1],coordinates[0]],
    13
);

L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
{
 attribution:'© OpenStreetMap'
}
).addTo(map);

L.marker(
[coordinates[1],coordinates[0]]
)
.addTo(map)
.bindPopup("Listing Location")
.openPopup();