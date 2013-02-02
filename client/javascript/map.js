$(function(){
    //var client = io.connect(window.location.host);
	var client = io.connect(':4005');
    var app = $('body');

    client.googleMapsContainer = (function(){
        var div = $('<div />')
            .attr('id', 'googleMapsContainer')
            .appendTo(app);
        return div;
    })();
    client.mapStyle = {
        day: (function(google){
            var style = new google.maps.StyledMapType(
                [{
                    "stylers": [
                        { "gamma": 0.99 }, 
                        { "hue": "#007fff" },
                        { "saturation": -69 }
                    ]
                }],
                { name: "Day"}
            );
                
            return style;
        })(google),
        night: (function(google){
            var style = new google.maps.StyledMapType(
                [{
                    "stylers": [
                        { "hue": "#007fff" },
                        { "invert_lightness": true }, 
                        { "gamma": 0.94 },
                        { "saturation": -70 }
                    ]
                }],
                {name: "Night"});
                
            return style;
        })(google)
    };
    
    client.map = (function(google){
        var map = new google.maps.Map( client.googleMapsContainer[0], {
            center  : client.project.info[client.activeProject].center,
            zoom    : client.project.info[client.activeProject].zoom,
            mapTypeControlOptions: {
              mapTypeIds: ['day', 'night', google.maps.MapTypeId.HYBRID ]
            },
            disableDefaultUI    : 1
        });
        
        map.mapTypes.set("day", client.mapStyle.day);
        map.mapTypes.set("night", client.mapStyle.night);
        map.setMapTypeId(client.project.info[client.activeProject].basemap);
        
        return map;
    })(google);
});
