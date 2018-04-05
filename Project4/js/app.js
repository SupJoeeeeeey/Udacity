var ViewModel = function(){
    this.optionsHeight = ko.observable('400px');

    this.toggleToHideAndShow = function(){
        var height
        if(this.optionsHeight() == '400px')
            this.optionsHeight('30px');
        else
            this.optionsHeight('400px');
    }
}

var map;
function initMap(){
    // TODO: use a constructor to create a new map JS object. You can use the coordinates
    // we used, 40.7413549, -73.99802439999996 or your own!
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat:31.7413549,lng:121.99802439999996},
        zoom: 13
    });
}

ko.applyBindings(new ViewModel());