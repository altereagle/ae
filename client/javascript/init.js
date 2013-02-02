$(function () {
    //var client = io.connect(window.location.host);
	var client = io.connect(':4005');
	client.username = null;
	client.user_id = Math.ceil(Math.random()*999999);
	client.activeProject = 0;
	client.project = {	// default map and project settings
		list: [0],
		info: [{
			project_name: null,
			synced: false,
			username: null,
			center: new google.maps.LatLng(5.353521355337423, -387.0703125),
			zoom: 3,
			basemap: "day",
		}],
        data: {
			wizardFieldNames: ['project_name', 'project_desc','project_admin','project_tag'],
			editableFieldsLabels: [{
				markers: "",
				polylines: "",
				polygons: ""
			}],
            editableFields: [{
                markers: ['Marker Attribute 1', 'Marker Attribute 2'],
                polylines: ['PolyLine Attribute 1', 'PolyLine Attribute 2'],
                polygons: ['Polygon Attribue 1', 'Polygon Attribute 2']
            }]
        }
    };
	
	
	client.features = []; // project feature container
	client.featureQueue = []; // feature queued for projects recieved en mass.
	
	// Editor globals
	client.isTyping = false;
    client.isEditing = false;
	client.mapViewSynced = false;
    client.hasTouch = Modernizr.touch;
    client.editorData = {
        currentTool: null,
        markers: [],
        lines: [],
        lineShapes: [],
        polygons: [],
        polyShapes: [],
        infoWindows: [],
        editEvent: {}
    };
	var app = $('body'); // Typing detection
	app.on('client_typing',function(event, isTyping){
        if(isTyping){
            client.isTyping = true;
            return;
        } else if (!isTyping){
            client.isTyping = false;
            return;
        } else {
            // do nothing
        }
    });
	// Tools and useful stuff
	client.tools = {
		toggleLoadingIcon: function(){
	        if ($('#loadingIcon').length > 0){
	                $('#loadingIcon').remove();
	            return;
	        } else {
	        var loadingIcon = $('<img />')
	            .attr('id', 'loadingIcon')
	            .attr('src', 'images/loading.gif')
	            .appendTo($('body'))
	            .show();
	            return loadingIcon;
	        }
	    },
		centerElement: function(selectedElement) {
		    var doc = $(document);
		    var x = doc.width() / 2 - selectedElement.width() / 2 - (parseInt(selectedElement.css("padding"), 10) / 2),
		        y = doc.height() / 2 - selectedElement.height() / 2 - (parseInt(selectedElement.css("padding"), 10) / 2);

		    selectedElement.css({
		        position: "absolute",
		        left: x,
		        top: y
		    });
		},
		urlArgs: function(url) {
	        var args = {};
	        var query;
	        var i;
	        if (url) {
	            i = url.indexOf('?');
	            query = url.substring(i).substring(1);
	        } else {
	            query = location.search.substring(1);
	        }
	        var pairs = query.split("&");
	        for (i = 0; i < pairs.length; i++) {
	            var pos = pairs[i].indexOf('=');
	            if (pos == -1) continue;
	            var name = pairs[i].substring(0, pos);
	            var value = pairs[i].substring(pos + 1);
	            value = decodeURIComponent(value);
	            args[name] = value;
	        }
	        return args;
	    }
	};

	client.tools.toggleLoadingIcon(); // Show loading icon
    var query = client.tools.urlArgs(); // Url Queries as an object

	client.on('connect', function () {
        client.tools.toggleLoadingIcon(); // Hide loading icon
		client.emit('login',{
			username: query.username || "example@example.com"
		})

    });
});		