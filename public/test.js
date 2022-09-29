var map;
var photos;
var markers;

$(document).ready(function() {
    initialize();

    $("#stuff").hide();
    $("#map").hide();
    $("#info").hide();
    $("#loading").hide();

    $("#form").submit(function(e){
        e.preventDefault();
        $("#stuff").hide();
        $("#map").hide();
        $("#info").hide();
        $("#loading").show();
        markers = [];
        var term = $("#term").val();
        if (term!=""){
            console.log(term);
            $("stuff").html("Loading...");

            $('button').prop('disabled', true);
            var request = $.get( "/photo-planner/search?text=" + term);
            request.success (function( data ){
                console.log(data);
                photos = JSON.parse(JSON.stringify(data));
                console.log(photos);
                html = ""

                for(var i = 0; i < photos.length; i++) {
                    var photo = photos[i];
                    html += '<img onclick="showPic(' + i
                    html += ')"src="https://farm6.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_n.jpg"></a>\n';
                    html += photo.title+'<br>'
                    html+= '<br>'
                    marker = (new google.maps.Marker({
                        position: {lat:parseFloat(photo.latitude), lng:parseFloat(photo.longitude)},
                        map: map,
                        title: photo.title
                    }));
                    (function(z){
                        google.maps.event.addListener(marker, "click", function() {
                            showPic(z);
                        });
                    })(i);
                    markers[i] = marker;

                }
                map.setCenter({lat:parseFloat(photos[0].latitude), lng:parseFloat(photos[0].longitude)});
                $( "#stuff" ).html(html);
                $("#map").show();
                google.maps.event.trigger(map, "resize");
                $("#stuff").show();
                $("#info").show();
                $("#loading").hide();
                $('button').prop('disabled', false);
                $('html, body').animate({
                    scrollTop: $( $("#main") ).offset().top
                }, 400);
            });
	    request.error(function() {
		$("#loading").html('<div class="alert alert-danger" role="alert">Something went wrong. The server might be down.</div>');
		$('button').prop('disabled', false);
	    });
        }
    })



})

function showPic(pic) {
    html = "";
    html += '<img src="https://farm6.staticflickr.com/' + photos[pic].server + '/' + photos[pic].id + '_' + photos[pic].secret + '.jpg"><br>';
    html += '<a target="_blank" href="http://www.flickr.com/' + photos[pic].user + "/" + photos[pic].id + '">Link</a><br>';
    var exifs = photos[pic].exif
    if (exifs.length === 0) {
        html += "No Exif Data<br>";
    } else {
        for(var j = 0; j < exifs.length; j++) {
            var exif = exifs[j];
            html+= exif.label + ": " + exif.data + "<br>";
        }
    }
    $("#info").html(html);
    map.setCenter({lat:parseFloat(photos[pic].latitude), lng:parseFloat(photos[pic].longitude)});
    map.setZoom(12);
    $('html, body').animate({
        scrollTop: $( $("#info") ).offset().top
    }, 400);
}


function initialize() {
    var mapProp = {
        center:new google.maps.LatLng(51.508742,-0.120850),
        zoom:5,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    map=new google.maps.Map(document.getElementById("map"),mapProp);
}
google.maps.event.addDomListener(window, 'load', initialize);
