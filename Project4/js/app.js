<<<<<<< HEAD
//ViewModel
var ViewModel = function(){
  var self = this;
  this.optionsHeight = ko.observable('500px');
  this.toggle = ko.observable('Hide Options');
  this.toggleList = ko.observable('Show Listing');
  this.locations = ko.observableArray(locations);
  this.currentMarker = ko.observable(null);
  this.weather = ko.observableArray([]);

  this.temp_min = ko.observable(0);
  this.temp_max = ko.observable(0);
  this.temp = ko.observable(0);
  this.humidity = ko.observable(0);

  //fetch weather data from 3rd party API
  this.updateTemp = function(){
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles,us&appid=7e7675f2474ec55221c482fde62dc590`)
    .then((res)=>{
      return res.json();
    }).
    then((response)=>{
      self.weather([
        `Min Temp: ${response.main.temp_min}`,
        `Max Temp: ${response.main.temp_max}`,
        `Current Temperature: ${response.main.temp}`,
        `Humidity: ${response.main.humidity}`
      ]);
    }).
    catch((e)=>{
      alert(`Error: ${e.message}`);
    });
  }

  this.showMarker = function(){
    viewModel.hideAllMarkers();
    var current = this;
    markers.forEach(function(marker){
      if(current.title == marker.title){
        marker.setVisible(true);
        viewModel.populateInfoWindow(marker);
        toggleBounce(marker);
      }
    });
  }

  this.toggleToHideAndShow = function(){
      var height
      if(this.optionsHeight() == '500px'){
          this.optionsHeight('30px');
          this.toggle('Show Options');
      }
      else{
          this.optionsHeight('500px');
          this.toggle('Hide Options');
      }
  }

  this.toggleMarker = function(){
      var flag = false;
      var bounds;
      if(this.toggleList()=='Show Listing'){
          flag = true;
          this.toggleList('Hide Listing');
          bounds = new google.maps.LatLngBounds();
      }
      else{
          this.toggleList('Show Listing');
          if(viewModel.currentMarker()!=null)
            viewModel.currentMarker().setVisible(false);
      }
      markers.forEach(function(marker){
          if(flag){
              marker.setAnimation(google.maps.Animation.DROP);
              marker.setVisible(true);
              bounds.extend(marker.position);
          }
          else
              marker.setVisible(false);
      });
      if(bounds)
          map.fitBounds(bounds);
  }

  this.filterList = function(){
    var str = document.getElementById('favoriteArea').value;
    if(str.length>0){
          this.locations(locations.filter( (location) => location.title.substr(0,str.length).toLowerCase() == str.toLowerCase()));
          markers.forEach((marker)=>{
            if(marker.title.substr(0,str.length).toLowerCase() == str.toLowerCase())
              marker.setVisible(true);
            else
              marker.setVisible(false);
          });
    }
    else{
      this.locations(locations);
      markers.forEach((marker)=>{
          marker.setVisible(true);
      });
    }
  }

  // This function allows the user to input a desired travel time, in
  // minutes, and a travel mode, and a location - and only show the listings
  // that are within that travel time (via that travel mode) of the location
  this.search = function() {
      // Initialize the distance matrix service.
      var distanceMatrixService = new google.maps.DistanceMatrixService;
      var address = 'University of Southern California';
      this.hideAllMarkers();
      // Use the distance matrix service to calculate the duration of the
      // routes between all our markers, and the destination address entered
      // by the user. Then put all the origins into an origin matrix.
      var origins = [];
      for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
      }
      var destination = address;
      var mode = document.getElementById('mode').value;
      // Now that both the origins and destination are defined, get all the
      // info for the distances between them.
      distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
          window.alert('Error was: ' + status);
      } 
      else {
          displayMarkersWithinTime(response);
      }
    });
  }

  // This function will go through each of the results, and,
  // if the distance is LESS than the value in the picker, show it on the map.
  function displayMarkersWithinTime(response) {
    var maxDuration = document.getElementById('duration').value;
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    viewModel.locations([]);
    // Parse through the results, and get the distance and duration of each.
    // Because there might be  multiple origins and destinations we have a nested loop
    // Then, make sure at least 1 result was found.
    var atLeastOne = false;
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        if (element.status === "OK") {
          // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
          // the function to show markers within a user-entered DISTANCE, we would need the
          // value for distance, but for now we only need the text.
          var distanceText = element.distance.text;
          // Duration value is given in seconds so we make it MINUTES. We need both the value
          // and the text.
          var duration = element.duration.value / 60;
          var durationText = element.duration.text;
          if (duration <= maxDuration) {
            //the origin [i] should = the markers[i]
            markers[i].setMap(map);
            atLeastOne = true;
            // Create a mini infowindow to open immediately and contain the
            // distance and duration
            var infowindow = new google.maps.InfoWindow({
              content: durationText + ' away, ' + distanceText +
                '<div><input type=\"button\" value=\"View Route\" onclick =' +
                '\"viewModel.displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
            });
            infowindow.open(map, markers[i]);
            // Put this in so that this small window closes if the user clicks
            // the marker, when the big infowindow opens
            markers[i].infowindow = infowindow;
            google.maps.event.addListener(markers[i], 'click', function() {
              this.infowindow.close();
            });
            viewModel.locations.push(markers[i]);
          }
        }
      }
    }
    if (!atLeastOne) {
      window.alert('We could not find any locations within that distance!');
    }
  }

  // This function is in response to the user selecting "show route" on one
  // of the markers within the calculated distance. This will display the route
  // on the map.
  this.displayDirections = function(origin) {
    this.hideAllMarkers();
    var directionsService = new google.maps.DirectionsService;
    // Get the destination address from the user entered value.
    var destinationAddress = 'University of Southern California';
    // Get mode again from the user entered value.
    var mode = document.getElementById('mode').value;
    directionsService.route({
      // The origin is the passed in marker's position.
      origin: origin,
      // The destination is user entered address.
      destination: destinationAddress,
      travelMode: google.maps.TravelMode[mode]
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
          var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          draggable: true,
          polylineOptions: {
          strokeColor: 'green'
          }
        });
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  this.populateInfoWindow = function (marker) {
    // var infowindow = new google.maps.InfoWindow();

    //bounce marker
    if(marker.getAnimation()===null){
        setTimeout(function(){
            marker.setAnimation(null);
        },1500);
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    // Check to make sure the infowindow is not already opened on this marker.
    if (currentWindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      currentWindow.setContent('');
      currentWindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      currentWindow.addListener('closeclick', function() {
        currentWindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            currentWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          currentWindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        currentWindow.open(map, marker);
      }
    }

  this.hideAllMarkers = function (){
      markers.forEach(function(marker){
          marker.setVisible(false);
      });
      if(viewModel.currentMarker()!=null)
        viewModel.currentMarker().setVisible(false);
  }

  this.dragElement = function(){
    var elmnt = document.getElementById('optionsBox');
    var dragElmnt = document.getElementById('toggleBar');
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var finalPosY = 50;
    var finalPosX = 20;

    dragElmnt.onmousedown = dragMouseDown;
    
  
    function dragMouseDown(e) {
      e = e || window.event;
      // get the mouse cursor position at startup:
      pos1 = e.clientX;
      pos2 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      // calculate the new cursor position:
      pos3 = e.clientX - pos1;
      pos4 = e.clientY - pos2;

      // set the element's new position:
      elmnt.style.top = (finalPosY + pos4) + "px";
      elmnt.style.left = (finalPosX + pos3) + "px";
    }
  
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      finalPosX = parseInt(elmnt.style.left.replace('px',''));
      finalPosY = parseInt(elmnt.style.top.replace('px',''));
    }
  }
}

//Google api stuff
var map;
var markers = [];

function initMap(){
  // TODO: use a constructor to create a new map JS object. You can use the coordinates
  // we used, 40.7413549, -73.99802439999996 or your own!
  map = new google.maps.Map(document.getElementById('map'),{
      center: {lat:34.0205111,lng:-118.285631},
      zoom: 13
  });

  // var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  highlightedIcon = makeMarkerIcon('FFFF24');

  currentWindow = new google.maps.InfoWindow();

  bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        map:map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i,
        visible:true
      });
      // Push the marker to our array of markers.
      markers.push(marker);

      bounds.extend(marker.position);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        viewModel.populateInfoWindow(this);
      });
      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
    map.fitBounds(bounds);
}
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon, highlightedIcon, currentWindow;
  
  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  
  //bounce marker
  function toggleBounce(marker) {
    setTimeout(function(){
        marker.setAnimation(null);
    },1000);
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }

//bind view model to html
var viewModel = new ViewModel();
ko.applyBindings(viewModel);
//set optionsBox as draggable
viewModel.dragElement();
viewModel.updateTemp();
=======
//ViewModel
var ViewModel = function(){
  var self = this;
  this.optionsHeight = ko.observable('500px');
  this.toggle = ko.observable('Hide Options');
  this.toggleList = ko.observable('Show Listing');
  this.locations = ko.observableArray(locations);
  this.currentMarker = ko.observable(null);
  this.weather = ko.observableArray([]);

  this.temp_min = ko.observable(0);
  this.temp_max = ko.observable(0);
  this.temp = ko.observable(0);
  this.humidity = ko.observable(0);

  //fetch weather data from 3rd party API
  this.updateTemp = function(){
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles,us&appid=7e7675f2474ec55221c482fde62dc590`)
    .then((res)=>{
      return res.json();
    }).
    then((response)=>{
      self.weather([
        `Min Temp: ${response.main.temp_min}`,
        `Max Temp: ${response.main.temp_max}`,
        `Current Temperature: ${response.main.temp}`,
        `Humidity: ${response.main.humidity}`
      ]);
    }).
    catch((e)=>{
      alert(`Error: ${e.message}`);
    });
  }

  this.showMarker = function(){
    viewModel.hideAllMarkers();
    var current = this;
    markers.forEach(function(marker){
      if(current.title == marker.title){
        marker.setVisible(true);
        viewModel.populateInfoWindow(marker);
        toggleBounce(marker);
      }
    });
  }

  this.toggleToHideAndShow = function(){
      var height
      if(this.optionsHeight() == '500px'){
          this.optionsHeight('30px');
          this.toggle('Show Options');
      }
      else{
          this.optionsHeight('400px');
          this.toggle('Hide Options');
      }
  }

  this.toggleMarker = function(){
      var flag = false;
      var bounds;
      if(this.toggleList()=='Show Listing'){
          flag = true;
          this.toggleList('Hide Listing');
          bounds = new google.maps.LatLngBounds();
      }
      else{
          this.toggleList('Show Listing');
          if(viewModel.currentMarker()!=null)
            viewModel.currentMarker().setVisible(false);
      }
      markers.forEach(function(marker){
          if(flag){
              marker.setAnimation(google.maps.Animation.DROP);
              marker.setVisible(true);
              bounds.extend(marker.position);
          }
          else
              marker.setVisible(false);
      });
      if(bounds)
          map.fitBounds(bounds);
  }

  this.filterList = function(){
    var str = document.getElementById('favoriteArea').value;
    if(str.length>0){
          this.locations(locations.filter( (location) => location.title.substr(0,str.length).toLowerCase() == str.toLowerCase()));
          markers.forEach((marker)=>{
            if(marker.title.substr(0,str.length).toLowerCase() == str.toLowerCase())
              marker.setVisible(true);
            else
              marker.setVisible(false);
          });
    }
    else{
      this.locations(locations);
      markers.forEach((marker)=>{
          marker.setVisible(true);
      });
    }
  }

  // This function allows the user to input a desired travel time, in
  // minutes, and a travel mode, and a location - and only show the listings
  // that are within that travel time (via that travel mode) of the location
  this.search = function() {
      // Initialize the distance matrix service.
      var distanceMatrixService = new google.maps.DistanceMatrixService;
      var address = 'University of Southern California';
      this.hideAllMarkers();
      // Use the distance matrix service to calculate the duration of the
      // routes between all our markers, and the destination address entered
      // by the user. Then put all the origins into an origin matrix.
      var origins = [];
      for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
      }
      var destination = address;
      var mode = document.getElementById('mode').value;
      // Now that both the origins and destination are defined, get all the
      // info for the distances between them.
      distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
          window.alert('Error was: ' + status);
      } 
      else {
          displayMarkersWithinTime(response);
      }
    });
  }

  // This function will go through each of the results, and,
  // if the distance is LESS than the value in the picker, show it on the map.
  function displayMarkersWithinTime(response) {
    var maxDuration = document.getElementById('duration').value;
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    viewModel.locations([]);
    // Parse through the results, and get the distance and duration of each.
    // Because there might be  multiple origins and destinations we have a nested loop
    // Then, make sure at least 1 result was found.
    var atLeastOne = false;
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        if (element.status === "OK") {
          // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
          // the function to show markers within a user-entered DISTANCE, we would need the
          // value for distance, but for now we only need the text.
          var distanceText = element.distance.text;
          // Duration value is given in seconds so we make it MINUTES. We need both the value
          // and the text.
          var duration = element.duration.value / 60;
          var durationText = element.duration.text;
          if (duration <= maxDuration) {
            //the origin [i] should = the markers[i]
            markers[i].setMap(map);
            atLeastOne = true;
            // Create a mini infowindow to open immediately and contain the
            // distance and duration
            var infowindow = new google.maps.InfoWindow({
              content: durationText + ' away, ' + distanceText +
                '<div><input type=\"button\" value=\"View Route\" onclick =' +
                '\"viewModel.displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
            });
            infowindow.open(map, markers[i]);
            // Put this in so that this small window closes if the user clicks
            // the marker, when the big infowindow opens
            markers[i].infowindow = infowindow;
            google.maps.event.addListener(markers[i], 'click', function() {
              this.infowindow.close();
            });
            viewModel.locations.push(markers[i]);
          }
        }
      }
    }
    if (!atLeastOne) {
      window.alert('We could not find any locations within that distance!');
    }
  }

  // This function is in response to the user selecting "show route" on one
  // of the markers within the calculated distance. This will display the route
  // on the map.
  this.displayDirections = function(origin) {
    this.hideAllMarkers();
    var directionsService = new google.maps.DirectionsService;
    // Get the destination address from the user entered value.
    var destinationAddress = 'University of Southern California';
    // Get mode again from the user entered value.
    var mode = document.getElementById('mode').value;
    directionsService.route({
      // The origin is the passed in marker's position.
      origin: origin,
      // The destination is user entered address.
      destination: destinationAddress,
      travelMode: google.maps.TravelMode[mode]
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
          var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          draggable: true,
          polylineOptions: {
          strokeColor: 'green'
          }
        });
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  this.populateInfoWindow = function (marker) {
    // var infowindow = new google.maps.InfoWindow();

    //bounce marker
    if(marker.getAnimation()===null){
        setTimeout(function(){
            marker.setAnimation(null);
        },1500);
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    // Check to make sure the infowindow is not already opened on this marker.
    if (currentWindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      currentWindow.setContent('');
      currentWindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      currentWindow.addListener('closeclick', function() {
        currentWindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            currentWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          currentWindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        currentWindow.open(map, marker);
      }
    }

  this.hideAllMarkers = function (){
      markers.forEach(function(marker){
          marker.setVisible(false);
      });
      if(viewModel.currentMarker()!=null)
        viewModel.currentMarker().setVisible(false);
  }

  this.dragElement = function(){
    var elmnt = document.getElementById('optionsBox');
    var dragElmnt = document.getElementById('toggleBar');
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var finalPosY = 50;
    var finalPosX = 20;

    dragElmnt.onmousedown = dragMouseDown;
    
  
    function dragMouseDown(e) {
      e = e || window.event;
      // get the mouse cursor position at startup:
      pos1 = e.clientX;
      pos2 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      // calculate the new cursor position:
      pos3 = e.clientX - pos1;
      pos4 = e.clientY - pos2;

      // set the element's new position:
      elmnt.style.top = (finalPosY + pos4) + "px";
      elmnt.style.left = (finalPosX + pos3) + "px";
    }
  
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      finalPosX = parseInt(elmnt.style.left.replace('px',''));
      finalPosY = parseInt(elmnt.style.top.replace('px',''));
    }
  }
}

//Google api stuff
var map;
var markers = [];

function initMap(){
  // TODO: use a constructor to create a new map JS object. You can use the coordinates
  // we used, 40.7413549, -73.99802439999996 or your own!
  map = new google.maps.Map(document.getElementById('map'),{
      center: {lat:34.0205111,lng:-118.285631},
      zoom: 13
  });

  // var largeInfowindow = new google.maps.InfoWindow();

  // Style the markers a bit. This will be our listing marker icon.
  defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  highlightedIcon = makeMarkerIcon('FFFF24');

  currentWindow = new google.maps.InfoWindow();

  bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        map:map,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i,
        visible:true
      });
      // Push the marker to our array of markers.
      markers.push(marker);

      bounds.extend(marker.position);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        viewModel.populateInfoWindow(this);
      });
      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
    map.fitBounds(bounds);
}
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon, highlightedIcon, currentWindow;
  
  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  
  //bounce marker
  function toggleBounce(marker) {
    setTimeout(function(){
        marker.setAnimation(null);
    },1000);
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }

//bind view model to html
var viewModel = new ViewModel();
ko.applyBindings(viewModel);
//set optionsBox as draggable
viewModel.dragElement();
viewModel.updateTemp();
>>>>>>> fdfd66e2316bb68c00cf2a1b4c0f97b71e289eac
window.setInterval(viewModel.updateTemp,600*1000);