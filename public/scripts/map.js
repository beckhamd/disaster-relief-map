var map;
var mapUser = [];
var mapHazards = [];
var mapAssistanceRequests = [];
var userLocation = { lat: 40.7829, lng: -73.9654 };

// Initializes the map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: userLocation,
    mapTypeId: 'terrain'
  });

  // Calls addEventMarker() when the map is clicked
  map.addListener('click', function(event) {
    addEventMarker(event.latLng);
  });

  // Initializes the user marker
  addUserMarker(userLocation);
}

// Adds a marker to the map and pushes it to the array
function addUserMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });

  mapUser.push(marker);
}

// Adds an event marker to the map and pushes it to the array
function addEventMarker(location) {
  var eventIcon = {
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 25)
  };

  // Use the proper icon
  if (document.getElementById("ar-opt").selected) {
    eventIcon["url"] = './icons/other.png';
  } else if (document.getElementById("fi-opt").selected) {
    eventIcon["url"] = './icons/fire.png';
  } else if (document.getElementById("fl-opt").selected) {
    eventIcon["url"] = './icons/flooding.png';
  } else if (document.getElementById("el-opt").selected) {
    eventIcon["url"] = './icons/electric.png';
  } else if (document.getElementById("to-opt").selected) {
    eventIcon["url"] = './icons/toxic.png';
  }

  var shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };
  
  // Creates the marker
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: eventIcon,
    shape: shape,
    animation: google.maps.Animation.DROP,
  });

  // Adds it to the proper array
  if (document.getElementById("ar-opt").selected) {
    mapAssistanceRequests.push(marker);
  } else {
    mapHazards.push(marker);
  }
}

// Removes hazards from the map and array
function deleteHazards() {
  for (var i = 0; i < mapHazards.length; i++) {
    mapHazards[i].setMap(null);
  }

  mapHazards = [];
}

// Removes assistance requests from the map and array
function deleteAssistanceRequests() {
  for (var i = 0; i < mapAssistanceRequests.length; i++) {
    mapAssistanceRequests[i].setMap(null);
  }

  mapAssistanceRequests = [];
}

// Removes all event markers from the Map
function deleteAll() {
  deleteHazards();
  deleteAssistanceRequests();
}
