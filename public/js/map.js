var map = null;
var mapAssistanceRequests = [];
var mapHazards = [];
var userLocation = { lat: 40.7829, lng: -73.9654 };

// Initializes the map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: userLocation,
    mapTypeId: 'terrain',
    zoom: 13
  });

  // Add the user location marker
  new google.maps.Marker({
    map: map,
    position: userLocation
  });

  // Call addEventMarker() when the map is clicked
  map.addListener('click', function(event) {
    addEventMarker(event.latLng);
  });
}

// Adds an event marker to the map and pushes it to the proper array
function addEventMarker(location) {
  let eventIcon = {
    anchor: new google.maps.Point(25, 25),
    origin: new google.maps.Point(0, 0),
    scaledSize: new google.maps.Size(50, 50)
  };

  // Use the proper icon
  if (document.getElementById('ar-opt').selected) {
    eventIcon['url'] = './img/other.png';
  } else if (document.getElementById('fi-opt').selected) {
    eventIcon['url'] = './img/fire.png';
  } else if (document.getElementById('fl-opt').selected) {
    eventIcon['url'] = './img/flooding.png';
  } else if (document.getElementById('el-opt').selected) {
    eventIcon['url'] = './img/electric.png';
  } else if (document.getElementById('to-opt').selected) {
    eventIcon['url'] = './img/toxic.png';
  }

  let shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };

  // Create the marker
  let marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    icon: eventIcon,
    map: map,
    position: location,
    shape: shape
  });

  // Push the marker to the proper array
  if (document.getElementById('ar-opt').selected) {
    mapAssistanceRequests.push(marker);
  } else {
    mapHazards.push(marker);
  }
}

// Removes assistance requests from the map and array
function deleteAssistanceRequests() {
  for (let i = 0; i < mapAssistanceRequests.length; i++) {
    mapAssistanceRequests[i].setMap(null);
  }

  mapAssistanceRequests = [];
}

// Removes hazards from the map and array
function deleteHazards() {
  for (let i = 0; i < mapHazards.length; i++) {
    mapHazards[i].setMap(null);
  }

  mapHazards = [];
}

// Removes all event markers from the map
function deleteAll() {
  deleteHazards();
  deleteAssistanceRequests();
}
