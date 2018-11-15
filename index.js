var isTracking = true;

require([
  "esri/layers/GraphicsLayer",
  "esri/widgets/Compass",
  "esri/symbols/TextSymbol",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/Graphic",
  "esri/widgets/Track",
  "esri/Map",
  "esri/views/MapView",
  "esri/symbols/PictureMarkerSymbol",
  "esri/tasks/QueryTask",
  "dojo/domReady!"
], function (GraphicsLayer, Compass, TextSymbol, Point, SimpleMarkerSymbol, SimpleLineSymbol, Color, Graphic, Track, Map, MapView, PictureMarkerSymbol, QueryTask) {

    var location_angle = 0;
    //
    var location_symbol = new SimpleMarkerSymbol({
      style: 'circle',
      color: [0, 94, 184],
      size: 15,  // pixels
      angle: location_angle,
      outline: {  // autocasts as esri/symbols//SimpleLineSymbol
        color: [255, 255, 255],
        width: 2.9  // points
      }
    });
    /*/
    var location_symbol = new SimpleMarkerSymbol(
      SimpleMarkerSymbol.STYLE_SQUARE, 10,
      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
      new Color([255,0,0]), 1),
      new Color([0,255,0,0.25])
    )
    //*/

    // CoreEngine - SetUp
    var map = new Map({
        basemap: "hybrid",
    });

    var view = new MapView({
        container: "myMap",
        map: map,
        zoom: 15,
        center: [-94.988056, 37.514444], // longitude, latitude
        constraints: {
            minZoom: 16,
            maxZoom: 20,
            rotationEnabled: true
        }
    });


    var dir_symbol = new SimpleMarkerSymbol({
      //style: 'square',
      path: 'M2,0h2l-4,-4l-4,4h2v4h4Z',
      color: [6, 140, 203],
      size: 30,
      outline: {
        color: [255, 255, 255],
        width: 2.9
      }
    })
    var dir_point = {
      type: 'point',
      longitude: -94.988056,
      latitude: 37.514444
    }
    var dir_graphic = new Graphic({
      geometry: dir_point,
      symbol: dir_symbol
    })
    var dir_layer = new GraphicsLayer()
    dir_layer.add(dir_graphic)



    var pulseLayer = new GraphicsLayer();

    var pulsateSymbol = new SimpleMarkerSymbol({
        style: "circle",
        color: [6, 140, 203],
        size: "30",
        outline: {
            color: [255, 255, 255],
            width: 2.9,
        }
    });

    // First create a point geometry (this is the location of the Stanford University Computer Science building)
    var pulsePoint = {
        type: "point",
        longitude: -122.173385,
        latitude: 37.4298637,
    };

    // Create a graphic and add the geometry and symbol to it
    var pointGraphic = new Graphic({
        geometry: pulsePoint,
        symbol: pulsateSymbol,
    });

    map.add(pulseLayer);


    // Create an instance of the Track widget and add it to the view's UI
    var track = new Track({
        view: view,
        geolocationOptions: { maximumAge: 0, timeout: 1500, enableHighAccuracy: true },
        goToLocationEnabled: false, // disable this since we want to control what happens after our location is acquired
        useHeadingEnabled: true,
        graphic: new Graphic({ // Overwrites the default symbol used for the graphic
            symbol: location_symbol,
            attributes: { "isMe": true },
        })
    });

    // Add the tracking icon to our map
    view.ui.add(track, "top-left");
    // Add the compass icon to our map.
    view.ui.add(new Compass({ view: view }), "top-left");
    // Exlude the zoom widget from the default UI from our map
    view.ui.components = ["attribution"];
    // Fires when the user pinches the view to look around.
    view.on("drag", function (event) {
        isTracking = false;
    });

    // CoreEngine Global variables.
    var isFound = false;
    var pulsatingLock = false;
    var bounceEventFired = false; // fixing a chrome bug.
    var accuracy = 0;
    var bubbles;

    // The sample will start tracking your location
    // once the view becomes ready
    view.when(function () {

        // Check if the sessionStorage object exists
        if (sessionStorage) {
            loadAllBytes();
            displayDestinationsOnMap();
        } else {
            ThrowError("Sorry, your browser do not support session storage.");
            localStorage.setItem("loadedBytes", {});
        }

        track.on("track", function (geolocation) {

            var location = track.graphic.geometry;
            pulsePoint.longitude = location.longitude;
            pulsePoint.latitude = location.latitude;
            displayGeolocation(geolocation.position);
            if (accuracy > 100) {  ThrowError('Your GPS accuracy is extremely poor. Try going outside or reloading the website.'); }

            findMeoLocation(location);

            if (isTracking) {
                view.goTo({
                    center: location,
                    //rotation: 360 - getHeading(location, view.center)
                });
            }
        });
        track.on("track-error", function (e) { ThrowError("There was an error while finding your GPS location. This problem may correct itself or may require a web refresh."); });
        track.start();

        $("#loadingMessage").fadeOut("slow", function () {
            $("#startDestinations").removeClass("hidden");
        });

    }).otherwise(function (err) {
        // A rejected view indicates a fatal error making it unable to display
        ThrownError("Mapview rejected:", err);
    });

    // Fires when the user clicks the view
    view.on("click", function (event) {

        var screenPoint = { x: event.x, y: event.y };
        view.hitTest(screenPoint).then(function (response) {

            if (response.results[0].graphic && response.results[0].graphic.attributes.canView) {

                document.getElementById("foundDestinationAudio").play();
                fadeDestination(response.results[0].graphic);
                response.results[0].graphic.attributes.canPulse = false;

                $("#discoveredMeobyte").modal().one("animationend animationend webkitAnimationEnd oanimationend MSAnimationEnd", function (event) {
                    if (!bounceEventFired) {

                        $("#foundDestination").css("visibility", "").attr("src", "img/foundMeobyteNoLoop.gif");
                        $("#discoveredMeobyte").modal().removeClass("bounceInUp");
                        isTracking = false;
                        bounceEventFired = true;

                        return $.ajax({  // loads the contect we MIGHT see if we open the chest.
                            type: "POST",
                            url: 'byteone.php',
                            dataType: "JSON",
                            data: { "longitude": response.results[0].graphic.geometry.latitude, "latitude": response.results[0].graphic.geometry.longitude },
                            success: function (results) {
                                if (results.success > 0) {

                                    // hide the sections
                                    $("#foundDestinationTreasureText").not(":hidden").addClass('hidden');
                                    $("#foundDestinationTreasureImage img").not(":hidden").addClass('hidden');
                                    $("foundDestinationTreasureAudio").not(":hidden").addClass('hidden');
                                    $("#foundDestinationLink").not(":hidden").addClass('hidden');

                                    if (results.data[7] == "text") {
                                        $("#foundDestinationTreasureText").removeClass('hidden').html(results.data[9]);
                                    }
                                    else if (results.data[7] == "photo") {
                                        $("#foundDestinationTreasureImage").removeClass('hidden').find("img").attr("src", results.data[8]);
                                    }
                                    else if (results.data[7] == "audio") {
                                        $("#foundDestinationTreasureAudio").removeClass('hidden').html(results.data[8]);
                                    }
                                    else if (results.data[7] == "link") {
                                        $("#foundDestinationLink a").attr('href', results.data[8]);
                                        $("#foundDestinationLink").removeClass('hidden');
                                    }
                                }
                                else {
                                    alert('DB ERROR!');
                                }
                            },
                            error: function (xhr, status, thrown) {
                                ThrowError(status + ": " + thrown);
                            }
                        });
                    }

                }).addClass("bounceInUp");

            }
        });

    });


    //window.addEventListener('deviceorientation', function (evt) {
    //  var x = Math.round(evt.beta);  // In degree in the range [-180,180]
    //  var y = Math.round(evt.gamma); // In degree in the range [-90,90]
    //  var z = Math.round(evt.alpha)
    //  $("#heading").html('Hdg. x/y/z: <nobr>' + x + '/' + y + '/' + z + '</nobr>')
    //})

    FULLTILT.getDeviceOrientation({'type': 'world'}).then(function(orientationControl) {
      orientationControl.listen(function() {
        var screenAdjustedEvent = orientationControl.getScreenAdjustedEuler();
        //var heading = Math.round(screenAdjustedEvent.alpha * Math.PI / 180);
        //var heading = parseFloat(Math.round((screenAdjustedEvent.alpha * Math.PI / 180) * 100) / 100).toFixed(2); // 2 decimals, pad
        location_angle = Math.round((screenAdjustedEvent.alpha * Math.PI / 180) * 50); // adjust to range 0 to 360
        //$("#heading").html('Hdg.: ' + heading)
        $("#heading").html('Hdg.: ' + location_angle)
        location_angle = -Math.abs(location_angle)

        dir_symbol = new SimpleMarkerSymbol({
          //style: 'square',
          path: 'M2,0h2l-4,-4l-4,4h2v4h4Z',
          color: [6, 140, 203],
          size: 15,
          angle: location_angle,
          outline: {
            color: [255, 255, 255],
            width: 2.9
          }
        })
        dir_point = {
          type: 'point',
          longitude: track.graphic.geometry.longitude,
          latitude: track.graphic.geometry.latitude
        }
        dir_graphic = new Graphic({
          geometry: dir_point,
          symbol: dir_symbol
        })
        dir_layer.removeAll()
        dir_layer.add(dir_graphic)
        map.add(dir_layer)
      })
    })

    // CoreEngine - Private Functions

    // loads all the destinations on the map
    function loadAllBytes() {
        return $.ajax({
            type: "POST",
            url: 'byteall.php',
            dataType: "JSON",
            success: function (results) {
                if (results.success > 0) {

                    // set all the opacity to 1
                    var len = results.data.length;
                    while(len--){
                        results.data[len].opacity = 1;
                    }

                    localStorage.setItem("loadedBytes", JSON.stringify(results.data));
                    displayDestinationsOnMap();

                } else {
                    ThrowError('There was an error connecting to the database.');
                }
            },
            error: function (xhr, status, thrown) {
                ThrowError(status + ": " + thrown);
            }
        });
    }

    // displays all the destinations on the map
    function displayDestinationsOnMap() {
        var meobyte = JSON.parse(localStorage.getItem("loadedBytes"));

        view.graphics.removeAll();

        var key = Object.keys(meobyte).length;
        if (key > 0) {
            while (key--) {
                var textSym = new TextSymbol();
                textSym.text = "\ue062";
                textSym.font = { size: 13, family: 'Glyphicons Halflings' };
                textSym.color = [255, 255, 255];
                textSym.yoffset = -6.5;
                textSym.xoffset = -0.3;

                var graphic1 = new Graphic({
                    geometry: Point({
                        longitude: meobyte[key].longitude,
                        latitude: meobyte[key].latitude
                    }),
                    symbol: textSym,
                    attributes: { "canView": false, "canPulse": true },
                });

                var simpleMarkerSymbol = new SimpleMarkerSymbol();
                simpleMarkerSymbol.color = [226, 119, 40];
                simpleMarkerSymbol.size = 20;
                simpleMarkerSymbol.outline.color = [255, 255, 255];
                simpleMarkerSymbol.outline.width = 2;
                simpleMarkerSymbol.style = "circle";

                var graphic2 = new Graphic({
                    geometry: Point({
                        longitude: meobyte[key].longitude,
                        latitude: meobyte[key].latitude,
                    }),
                    symbol: simpleMarkerSymbol,
                    attributes: { "canView": false, "canPulse": true },
                });

                view.graphics.add(graphic2);
                view.graphics.add(graphic1);
            }
        }
    }

    // fills our statistics table with values.
    function displayGeolocation(position) {
        //console.log(position.coords.latitude);
        var altitude = "n/a";
        if (position.coords.altitude != null) altitude = position.coords.altitude.toFixed(2) + "m";
        var speed = "n/a";
        if (position.coords.speed != null) (position.coords.speed * 3600 / 1000).toFixed(2) + "km/hr";
        var heading = "n/a";
        if (position.coords.heading != null) heading = position.coords.heading.toFixed(2) + "deg";

        $("#location").text(position.coords.latitude.toFixed(4) + ", " + position.coords.longitude.toFixed(4));
        $("#altitude").text("Alt: " + altitude);
        $("#speed").text("Spd: " + speed);
        //$("#heading").text("Hdg: " + heading);

        //Tested on desktop IE9, Chrome 17, Firefox 10, Safari ?
        //Mobile browser: Android 2.3.6
        //There is a bug in Safari browsers on Mac that shows the year as 1981
        //To get around the bug you could manually parse and then format the date. I chose not to for this project.
        accuracy = position.coords.accuracy.toFixed(2);
        var date = new Date(position.timestamp)
        $("#timestamp").text(date.toLocaleString());
        $("#accuracy").text("Acc: " + position.coords.accuracy.toFixed(2) + "m");
        $("#geo-indicator").html("Geo: ON");
        $("#geo-indicator").css('color', 'green');
    }

    // checks if our current location is near a destination
    function findMeoLocation(position) {
        var desiredRadiusInKm = 0.02; //0.012192; //40 feet
        var meobyte = JSON.parse(localStorage.getItem("loadedBytes"));

        // clear/set all graphics canView flag to false.
        isFound = false;

        // check if the graphic is in range and if we can set the canView flag to true.
        var key = Object.keys(meobyte).length;
        if (key > 0) {
            while (key--) {
                if (distance(position.latitude, position.longitude, meobyte[key].latitude, meobyte[key].longitude) <= desiredRadiusInKm) {

                    //WE FOUND A MEOBYTE
                    isFound = true;

                    view.graphics.forEach(function (byte) {
                        if (typeof byte != "undefined" && byte.attributes && !byte.attributes.isMe) {
                            if (byte.geometry != null && byte.geometry.x == meobyte[key].longitude && byte.geometry.y == meobyte[key].latitude) {
                                byte.attributes.canView = true;

                                // make the destination pulse.
                                if (byte.attributes.canPulse) {
                                    pulse();
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    // https://community.esri.com/message/749494-how-to-hook-events-on-graphics-layer-at-46
    // https://codepen.io/governorfancypants/pen/xwMegL
    // https://stackoverflow.com/questions/30703212/how-to-convert-radius-in-metres-to-pixels-in-mapbox-leaflet
    function pulse() {

        //if (pulsatingLock) { return; }

        var pixelMeterSizes = null;
        var opacity = 0.45;
        var width = getPixelSize();
        pulsatingLock = true;

        function reduceOpacity() {
            // fade

            pulseLayer.removeAll();

            pulsateSymbol.size = width;
            pulsateSymbol.color = [6, 140, 203, opacity];
            pulsateSymbol.outline.color = [255, 255, 255, opacity];
            pointGraphic = new Graphic({
                geometry: pulsePoint,
                symbol: pulsateSymbol
            });

            pulseLayer.add(pointGraphic);

            opacity -= 0.008;
            width += 1.15;
            if (opacity <= 0) {
                clearInterval(fade);
                pulsatingLock = false;
                return;
            }
        }

        var fade = setInterval(reduceOpacity, 18);
    }

    // Fires when the user clicks on destiantion and changes the opacity.
    function fadeDestination(destination) {
        var clickedDest = view.graphics.filter(function (elem) { return elem.geometry.x === destination.geometry.longitude && elem.geometry.y === destination.geometry.latitude });

        if (clickedDest.length > 0) {
            clickedDest.items.forEach(function (item, index) {

                var newItem = item.clone();
                if (newItem.symbol.style == "circle") {
                    newItem.symbol.color = [226, 119, 40, 0.45];
                    newItem.symbol.outline.color = [255, 255, 255, 0.55];
                }
                else {
                    newItem.symbol.color = [255, 255, 255, 0.75];
                    newItem.symbol.text = "\ue084";
                    newItem.symbol.xoffset = 0;
                }

                newItem.attributes.canPulse = false;

                view.graphics.remove(item);
                view.graphics.add(newItem);
            });
        }
    }

    //// HELPER Functions ////

    // find the mathematical difference between the destinations and current location
    function distance(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a =
           0.5 - Math.cos(dLat) / 2 +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           (1 - Math.cos(dLon)) / 2;

        return R * 2 * Math.asin(Math.sqrt(a));
    }

    // gets the size of the circle based on the view.
    function getPixelSize() {
        // based on 40 feet radius
        switch (view.zoom) {
            case 16:
                return 17;
            case 17:
                return 34;
            case 18:
                return 67;
            case 19:
                return 134;
            case 20:
                return 255;
        }
    }

    function getHeading(point, oldPoint) {
        // get angle between two points
        var angleInDegrees = Math.atan2(point.y - oldPoint.y, point.x - oldPoint.x) * 180 / Math.PI;

        // move heading north
        return -90 + angleInDegrees;
    }

    function ThrowError(message){
        $("#alertError").show().find("#alertMessage").html(message);
    }


    // UI Events attacked with JQuery

    $(document).ready(function () {

        // fires when the user clicks the "Start Destinations" button
        $("#startDestinations").on("click", function () {
            $("#titleScreen").fadeOut("slow", function () {
                $("#infoMeobyte").modal('show');
                clearInterval(bubbles);
            });
        });

        // fires when users click the "Show Me" modal link.
        $("#showMeDestinations").on("click", function () {
            $("#infoMeobyte").modal('hide');
            view.zoom = 18;

            // center us in front of the science building.
            view.goTo([-94.986620, 37.513756], { speedFactor: 0.1, easing: "out-quint" });
        });

        // Fires when the user clicks the tracking icon in the view.ui.
        $("div.esri-ui-corner").on("click", function (event) {
            var trackButton = $(event.target);
            if (trackButton.hasClass("esri-track") || trackButton.hasClass("esri-icon-pause")) {
                isTracking = true;
            }
        });

        // Fires when the user closes the modal window.
        $('#discoveredMeobyte').on('hidden.bs.modal', function () { //beforeClose
            isTracking = true;
            bounceEventFired = false;

            $("#discoveredMeobyte").removeClass("bounceInUp grow");
            $("#foundDestination").attr("src", "img/foundMeobyteClosed.gif");
            $("#destination-content").addClass("hidden");

            $("#foundDestination").css("visibility", "hidden").attr("src", "");
        });

        // fires when the user clicks the treasure box
        $("#foundDestination").on("click", function (e) {

            if ($("#discoveredMeobyte").hasClass('grow')) {
                $("#discoveredMeobyte").removeClass("bounceInUp grow");
                $("#foundDestination").attr("src", "img/foundMeobyteClosed.gif");
                $("#destination-content").addClass("hidden");
            }
            else {
                $("#discoveredMeobyte").addClass("bounceInUp grow");
                $("#foundDestination").attr("src", "img/foundMeobyteOpening.gif");
                $("#destination-content").removeClass("hidden");

                document.getElementById("openChest").play();
            }
        });

        ///////////////// == BUBBLES! == /////////////////

        // Define a blank array for the effect positions. This will be populated based on width of the title.
        var bArray = [];
        // Define a size array, this will be used to vary bubble sizes
        var sArray = [6, 8, 10, 12, 14];

        // Push the header width values to bArray
        for (var i = 0; i < $('.bubbles').width() ; i++) {
            bArray.push(i);
        }

        // Function to select random array element
        // Used within the setInterval a few times
        function randomValue(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // setInterval function used to create new bubble every 350 milliseconds
        bubbles = setInterval(function () {

            // Get a random size, defined as variable so it can be used for both width and height
            var size = randomValue(sArray);
            // New bubble appeneded to div with it's size and left position being set inline
            // Left value is set through getting a random value from bArray
            $('.bubbles').append('<div class="individual-bubble" style="left: ' + randomValue(bArray) + 'px; width: ' + size + 'px; height:' + size + 'px;"></div>');

            // Animate each bubble to the top (bottom 100%) and reduce opacity as it moves
            // Callback function used to remove finsihed animations from the page
            $('.individual-bubble').animate({
                'bottom': '100%',
                'opacity': '-=0.7'
            }, 3000, function () {
                $(this).remove()
            }
            );
        }, 350);

    });
});
