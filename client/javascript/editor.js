$(function(){
	//var client = io.connect(window.location.host);
	var client = io.connect(':4005');
    var project = client.project;
    var editableFieldsPolygons  = project.data.editableFields[client.activeProject].polygons;
    var map = client.map;
    var app = $('body');
    
    client.cursorPosition = {
        x:0,
        y:0
    };
    
    $(document).click(function(event){
        client.cursorPosition.x = event.clientX;
        client.cursorPosition.y = event.clientY;
    });
    
    client.editorTools = (function(){
        var div = $('<div />')
            .attr('id', 'editorTools')
            .addClass('interface')
            .draggable()
            .append(
                $('<button />')
                    .addClass('points')
                    .html('Draw Points')
                    .click(function(){
                        client.editorData.currentTool = "Marker";
						
                        $(this).html('Drawing ' + client.project.data.editableFieldsLabels[client.activeProject].markers);
                        $('#editorTools').find('button.lines').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].polylines);
                        $('#editorTools').find('button.polygons').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].polygons);
                        $('#editorTools').find('button').css('opacity',0.3);
                        $(this).css('opacity', 1);
                        $(this).prepend(
							$('<div />')
								.attr('id','pointToolImg')
								.addClass('editorToolLabel')
						);
                        if(client.isEditing){
                            google.maps.event.removeListener(client.editEvent);
                            client.editEvent = google.maps.event.addListener(client.map, 'click', createMarker);
                        }
                    })
					.hover(function(){
						if(client.editorData.currentTool === "Marker")return;
						$(this).css('opacity', 1);
					},function(){
						if(client.editorData.currentTool === "Marker")return;
						$(this).css('opacity', 0.3);
					})
            )
            .append(
                $('<button />')
                    .addClass('lines')
                    .html('Draw Lines')
                    .click(function(){
                        client.editorData.currentTool = "Line";
                        $(this).html('Drawing ' + client.project.data.editableFieldsLabels[client.activeProject].polylines);
                        $('#editorTools').find('button.points').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].markers);
                        $('#editorTools').find('button.polygons').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].polygons);
                        $('#editorTools').find('button').css('opacity',0.3);
                        $(this).css('opacity', 1);
                        $(this).prepend(
							$('<div />')
								.attr('id','lineToolImg')
								.addClass('editorToolLabel')
						);
                        if(client.isEditing){
                            google.maps.event.removeListener(client.editEvent);
                            client.editEvent = google.maps.event.addListener(client.map, 'click', createLine);
                        }
                    })
					.hover(function(){
						if(client.editorData.currentTool === "Line")return;
						$(this).css('opacity', 1);
					},function(){
						if(client.editorData.currentTool === "Line")return;
						$(this).css('opacity', 0.3);
					})
            )
            .append(
                $('<button />')
                    .addClass('polygons')
                    .html('Draw Polygons')
                    .click(function(){
                        client.editorData.currentTool = "Polygon";
                        $(this).html('Drawing ' + client.project.data.editableFieldsLabels[client.activeProject].polygons);
                        $('#editorTools').find('button.points').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].markers);
                        $('#editorTools').find('button.lines').html('Draw '+client.project.data.editableFieldsLabels[client.activeProject].polylines);
                        $('#editorTools').find('button').css('opacity',0.3);
                        $(this).css('opacity', 1);
						$(this).prepend(
							$('<div />')
								.attr('id','polyToolImg')
								.addClass('editorToolLabel')
						);
                        if(client.isEditing){
                            google.maps.event.removeListener(client.editEvent);
                            client.editEvent = google.maps.event.addListener(client.map, 'click', createPolygon);
                        }
                    })
					.hover(function(){
						if(client.editorData.currentTool === "Polygon")return;
						$(this).css('opacity', 1);
					},function(){
						if(client.editorData.currentTool === "Polygon")return;
						$(this).css('opacity', 0.3);
					})
            )
            .appendTo($('body'));
        return div;
    })();
    client.editor = (function () {
        var div = $('<div />')
            .attr('id', 'editor')
            .addClass('interface')
            .droppable({
                accept: '#contextMenu',
                drop: function(event, ui){
                    $(this).effect('highlight');
                    
                    client.contextMenu.effect('drop',function(){
                        var htmlString = $(this).html();
                        var item = $('<div />')
                            .addClass('commit')
                            .attr('markerIndex', client.editorData.markers.length-1)
                            .attr('lineIndex', client.editorData.lineShapes.length-1)
                            .attr('polyIndex', client.editorData.polyShapes.length-1)
                            .dblclick(function(){
                                var i = $(this).attr('markerIndex');
                                var marker = client.editorData.markers[i];
                                client.map.panTo(
                                    (function(){
                                        try{
                                            return marker.getPosition();
                                        } catch(err){
                                            console.log(err, 'marker error');
                                        }
                                    })()
                                );
                                var infowindow = new google.maps.InfoWindow({
                                    content: htmlString
                                });
                                
                                for(var j=0;j<client.editorData.infoWindows.length;j++){
                                    client.editorData.infoWindows[j].close();
                                }
                                client.editorData.infoWindows.length = 0;
                                client.editorData.infoWindows.push(infowindow);
                                
                                infowindow.open(client.map, marker);
                            })
                            .append(htmlString)
                            .append(
                                $('<button />')
                                    .attr('id', 'deleteEditButton')
                                    .html('Delete Edit')
                                    .click(function(){
                                        item.effect('puff',function(){
                                            var i = item.attr('markerIndex');
                                            var j = item.attr('lineIndex');
                                            var k = item.attr('polyIndex');
                                            if(i != -1){
                                                client.editorData.markers[i].setMap(null);
                                            }
                                            if(j != -1){
												client.editorData.lineShapes[j].setMap(null);
                                            }
                                            if(k != -1){
                                                client.editorData.polyShapes[k].setMap(null);    
                                            }
                                            item.remove();
                                        });
                                    })
                            
                            );
                        client.commitList.append(item);
                    });
                    client.attributeEditor.effect('explode',function(){
                    });
                }
            })
            .appendTo($('body'));
        return div;
	})(),
    client.commitList = (function(){
        var div = $('<div />')
            .attr('id', 'commitList')
            .addClass('interface')
            .appendTo(client.editor);
        return div;
    })(),
	client.attributeEditor = (function(){
        var div = $('<div />')
            .attr('id', 'attributeEditor')
            .addClass('interface userInput')
            .html('Set ')
            .append($('<select />'))
            .append(' to: ')
            .append(
                $('<input />')
                    .focus(function(){
                        app.trigger('client_typing', true);
                    })
                    .keypress(function(event){
                        if(event.charCode !== 13) return;
                        $(this).blur();
                        $(this).effect('transfer',{
                            to: "#contextMenu",
                            className: "userInputSubmit"
                        },function(){
                            var markers = client.editorData.markers;
                            $('#contextMenu').effect('highlight');
                            var selectedOption = client.attributeEditor.find('select').find('option:selected').html();
                            var userInput = $(this).val();
                            client.contextMenu.find('#projectDataAttributes')
                                .append(
                                    $('<div />')
                                        .html(selectedOption+': '+userInput)
                                        .dblclick(function(event){
                                            event.stopPropagation();
                                            $(this).remove();
                                        })
                                        .attr('marker', (function(){
                                            if(markers[markers.length-1]){
                                                return markers[markers.length-1].title;   
                                            } else {
                                                return 0;
                                            }
                                        })())
                                );
                            $(this).val('');
                            client.attributeEditor.find('select').focus();
                        });
                        app.trigger('client_typing', false);
                    })
                    .blur(function(){
                        app.trigger('client_typing', false);
                    })
            )
            .appendTo($('body'))
            .draggable();
        return div;
	})();
	client.contextMenu = (function () {
        var div = $('<div />')
            .attr('id', 'contextMenu')
            .addClass('interface')
            .draggable()
            .appendTo($('body'));
        return div;
	})();
    
    app.keypress(function(event){
       if(event.charCode === 32 && !client.isTyping){
           event.stopPropagation();
            toggleEditor();
       }
    });

    window.ontouchmove = function(event){return event.preventDefault();};    
    app[0].ontouchstart = function(event){
        if(event.touches.length === 3 && !client.isTyping){
            event.preventDefault();
            toggleEditor();
        }
    };
    
    function toggleEditor(){
        var editorVisible = client.editor.is(":visible");
        if(editorVisible){
            hideEditor(event,function(){
                saveEdits(function(){
                    clearMarkers();
                    clearCommitList();
                });
            });
        } else if (!editorVisible){
            showEditor(event);
        }
    }
    
    function saveEdits(callback){
        var commits = client.commitList.find('.commit');
        
        var edits = {
            from    : client.username,
			user_id	: client.user_id,
			project_id: client.project.list[client.activeProject-1],
			project_name: project.info[client.activeProject].project_name,
            geometry: {
                type: "FeatureCollection",
                features: []
            }
        };
        
        function createGeoJSON(commit){
            var lat = commit.find('div.lat').html()
                .slice(commit.find('div.lat').html().indexOf(': ')+2);
            var lon = commit.find('div.lon').html()
                .slice(commit.find('div.lon').html().indexOf(': ')+2);
            var shapeType = commit.find('div.shape').html()
                .slice(commit.find('div.shape').html().indexOf(': ')+2);
            var geoJSON = {
                "type": "feature",
                "geometry": {
                    "type": shapeType,
                    "coordinates": (function(){
                        if(shapeType === 'Point'){
                            return [lon, lat];
                        }
                        if(shapeType === 'LineString'){
                            return $.parseJSON(commit.find('div.shape').attr('coords'));
                        }
                        if(shapeType === 'Polygon'){
                            return $.parseJSON(commit.find('div.shape').attr('coords'));
                        }
                    })(),
                },
                "properties": (function(){
                    var properties = {
                        address: commit.find('div.addr').html(),
                        date: commit.find('div.date').html()
                        .slice(commit.find('div.date').html().indexOf(': ') + 2)
                    };
                    var attributes = commit.find('#projectDataAttributes').find('div');
                    if(attributes.length === 0) return properties;
                    for(var i=0; i < attributes.length; i++){
                        var attribute = $(attributes[i]).html().split(': ')[0];
                        var value = $(attributes[i]).html()
                            .slice($(attributes[i]).html().indexOf(': ') + 2);
                        
                        properties[attribute] = value;
                    }
                    return properties;
                })()
            };
            
            return geoJSON;
        }
        
        for(var i=0;i<commits.length;i++){
            var data = createGeoJSON($(commits[i]));
            edits.geometry.features.push(data);
        }
		if(edits.geometry.features.length != 0){
        	client.emit('save_edits', {
	            lat : map.getCenter().Ya,
	            lon : map.getCenter().Za,
	            zoom: map.getZoom(),
	            mapType : map.getMapTypeId(),
	            user_id : client.user_id,
				project_id: parseInt(client.project.list[client.activeProject]),
	            edits: edits
	        });
		}
        
        if(callback instanceof Function) callback();
    }
    
    function clearMarkers(){
        var markers = client.editorData.markers;
        for(var i=0; i < markers.length; i++){
            markers[i].setMap(null);
        }
        markers.length = 0;
        
        var lineShapes = client.editorData.lineShapes;
        for(var j=0; j < lineShapes.length; j++){
            lineShapes[j].setMap(null);
        }
        lineShapes.length = 0;
        
        var polyShapes = client.editorData.polyShapes;
        for(var k=0; k < polyShapes.length; k++){
            polyShapes[k].setMap(null);
        }
        polyShapes.length = 0;
    }
    function clearCommitList(){
        client.commitList.html('');
    }
    
    function showEditor(event){
        app.trigger('client_editing', true);
        client.editor.removeClass('editorEffects');
        client.editor.effect('slide',function(){
            client.editor.addClass('editorEffects background');
            client.editorTools.fadeIn();
        });
        
        $('#chatBox')
            .removeClass('fancyChatStyle')
            .animate({
               width: '50%',
               left: '25%'
            },function(){
                $(this).addClass('fancyChatStyle');
            });
		
		client.editorTools.find('.points').html('Draw ' + client.project.data.editableFieldsLabels[client.activeProject].markers);
		client.editorTools.find('.lines').html('Draw ' + client.project.data.editableFieldsLabels[client.activeProject].polylines);
		client.editorTools.find('.polygons').html('Draw ' + client.project.data.editableFieldsLabels[client.activeProject].polygons);
    }

    function hideEditor(event, callback){
        client.attributeEditor.find('select').blur();
        app.trigger('client_editing', false);
        client.editor.removeClass('editorEffects');
        client.editor.effect('fold',function(){
            client.editor.hide();
        });
        client.editorTools.find('button').css('opacity',1);
        client.editorTools.fadeOut();
        $('#chatBox')
            .removeClass('fancyChatStyle')
            .animate({
               width: '55%',
               left: '20%'
            },function(){
                $(this).addClass('fancyChatStyle');
            });
        
        client.attributeEditor.hide();
        client.contextMenu.hide();
        if(callback instanceof Function) callback();
    }
    
    app.on('client_editing',function(event, isEditing){
        if(isEditing){
            client.isEditing = true;
            return;
        } else if (!isEditing){
            client.isEditing = false;
            google.maps.event.removeListener(client.editEvent);
            return;
        } else {
            // do nothing
        }
    });
    
    function createMarker(event){
        var lat = event.latLng.Ya,
            lon = event.latLng.Za,
            x = event.pixel.x,
            y = event.pixel.y; 
        var markerList = client.editorData.markers;
        
        client.attributeEditor.find('select').html('');
        for(var i=0; i < client.project.data.editableFields[client.activeProject].markers.length;i++){
            client.attributeEditor.find('select')
                .append(
                    $('<option />')
                        .html(client.project.data.editableFields[client.activeProject].markers[i])
                );
        }
        
        client.attributeEditor
            .css({
                top: y - 120 + 'px',
                left: x - (client.attributeEditor.width()/2) + 'px'
            })
            .fadeIn();
        
        client.contextMenu.html('')
            .append(
                $('<div />')
                    .html('')
                    .attr('id', 'projectDataAttributes')
            )
            .append(
                $('<div />')
                    .html('Latitude: '+lat)
                    .addClass('lat unEditable')
            )
            .append(
                $('<div />')
                    .html('Longitude: '+lon)
                    .addClass('lon unEditable')
            )
            .append(
                $('<div />')
                    .html('Shape: '+ "Point")
                    .addClass('shape unEditable')
            )
            .append(
                $('<div />')    
                    .html('Created: '+ (function(){ return new Date()})())
                    .addClass('date unEditable')
            )
            .css({
                top: y + 10 + 'px',
                left: x - (client.contextMenu.width()/2) + 'px'
            })
            .dblclick(function(){
				try{
					markerList[markerList.length-1].setMap(null);
				} catch (err){
					console.log(err);
				}
                
                client.contextMenu.fadeOut();
                client.attributeEditor.fadeOut();
            })
            .fadeIn(function(){
                client.attributeEditor.find('select').focus();
                var clickPosition = new google.maps.LatLng(lat, lon);
                (function(){
                    var marker = new google.maps.Marker({
                        map     : map,
                        title   : client.id + "_marker_" + String(new Date().getTime()),
                        position: clickPosition,
                        icon    : 'images/map_icon_editing.png',
                        animation: google.maps.Animation.DROP
                    });
                    markerList.push(marker);
                })();
            });
        
        
        geocode({
            lat: lat,
            lon: lon,
            callback: function(data){
                client.contextMenu
                    .append(
                        $('<div />')
                            .html(data.address)
                            .addClass('addr')
                    );
            }
        });
    }
    
    function createLine(event){
        var lat = event.latLng.Ya,
            lon = event.latLng.Za;
        client.editorData.lines.push(new google.maps.LatLng(lat, lon));
        var lineCoordinates = client.editorData.lines;
        
        var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4
        };
        
        if (lineCoordinates.shape) {lineCoordinates.shape.setMap(null)}
        client.editorData.lines.shape = new google.maps.Polyline({
            path: lineCoordinates,
            strokeOpacity: 0,
            icons: [{
                icon: lineSymbol,
                offset: '0',
                repeat: '20px'
            }],
            editable: true,
            map: map
        });
        google.maps.event.addListener(client.editorData.lines.shape, 'dblclick', endLine);
    }
    
    function endLine(event){
        event.stop();
        var lat = event.latLng.Ya,
            lon = event.latLng.Za,
            x = client.cursorPosition.x,
            y = client.cursorPosition.y;
            
        var markerList = client.editorData.markers;
        var lineShapes = client.editorData.lineShapes;
        var lineCoordinates = client.editorData.lines;
        var lineCoordString = "[";
        
        for (var i=0; i<lineCoordinates.length; i++){
            var coordLat = lineCoordinates[i].Ya;
            var coordLon = lineCoordinates[i].Za;
            if(i === (lineCoordinates.length - 1)){
                lineCoordString += ("[" + coordLon + "," + coordLat + "]");
            } else {
                lineCoordString += ("[" + coordLon + "," + coordLat + "],");
            }
        }
        lineCoordString += "]";
        
        client.attributeEditor.find('select').html('');
        for(var i=0; i < client.project.data.editableFields[client.activeProject].polylines.length;i++){
            client.attributeEditor.find('select')
                .append(
                    $('<option />')
                        .html(client.project.data.editableFields[client.activeProject].polylines[i])
                );
        }
        
        client.attributeEditor
            .css({
                top: y - 120 + 'px',
                left: x - (client.attributeEditor.width()/2) + 'px'
            })
            .fadeIn();
        
        client.contextMenu.html('')
            .append(
                $('<div />')
                    .html('')
                    .attr('id', 'projectDataAttributes')
            )
            .append(
                $('<div />')
                    .html('Shape: '+ "LineString")
                    .attr('coords', lineCoordString)
                    .addClass('shape unEditable')
            )
            .append(
                $('<div />')
                    .html('Latitude: '+lat)
                    .addClass('lat unEditable')
            )
            .append(
                $('<div />')
                    .html('Longitude: '+lon)
                    .addClass('lon unEditable')
            )
            .append(
                $('<div />')    
                    .html('Created: '+ (function(){ return new Date()})())
                    .addClass('date unEditable')
            )
            .css({
                top: y + 10 + 'px',
                left: x - (client.contextMenu.width()/2) + 'px'
            })
            .dblclick(function(){
				try{
					markerList[markerList.length-1].setMap(null);
	                lineShapes[lineShapes.length-1].setMap(null);
	                client.editorData.lines.length = 0;
	                client.editorData.lines.shape.setMap(null);
				} catch (err){
					console.log(err);
				}
                client.contextMenu.fadeOut();
                client.attributeEditor.fadeOut();
            })
            .fadeIn(function(){
                client.attributeEditor.find('select').focus();
                var clickPosition = new google.maps.LatLng(lat, lon);
                
                (function(){
                    var marker = new google.maps.Marker({
                        map     : map,
                        title   : client.id + "_marker_" + String(new Date().getTime()),
                        position: clickPosition,
                        icon    : 'images/map_icon_editingLines.png',
                        animation: google.maps.Animation.DROP
                    });
                    markerList.push(marker);
                })();
                
                if(client.editorData.lines.shape) {client.editorData.lines.shape.setMap(null)}
                (function(){
                    var polyLineMarker = new google.maps.Polyline({
                        path: lineCoordinates,
                        strokeOpacity: 1,
                        icons: [{
                            offset: '0',
                            repeat: '20px'
                        }],
                        map: map
                    });
                    polyLineMarker.coords = lineCoordinates;
                    lineShapes.push(polyLineMarker);
                    lineCoordinates.length = 0;
                })();
            });
    }
    
    function createPolygon(event){
        var lat = event.latLng.Ya,
            lon = event.latLng.Za;
        client.editorData.polygons.push(new google.maps.LatLng(lat, lon));
        var polygonCoordinates = client.editorData.polygons;
        
        if (polygonCoordinates.shape) {polygonCoordinates.shape.setMap(null)}
        client.editorData.polygons.shape = new google.maps.Polygon({
            path: polygonCoordinates,
            fillColor: "#000",
            fillOpacity: 0.5,
            strokeWeight: 2,
            editable: true,
            map: map
        });
        google.maps.event.addListener(client.editorData.polygons.shape, 'dblclick', endPoly);
    }
    
    function endPoly(event){
        event.stop();
        var lat = event.latLng.Ya,
            lon = event.latLng.Za,
            x = client.cursorPosition.x,
            y = client.cursorPosition.y;
            
        var markerList = client.editorData.markers;
        var polyShapes = client.editorData.polyShapes;
        var polygonCoordinates = client.editorData.polygons;
        var polyCoordString = "[";
        
        for (var i=0; i<polygonCoordinates.length; i++){
            var coordLat = polygonCoordinates[i].Ya;
            var coordLon = polygonCoordinates[i].Za;
            if(i === (polygonCoordinates.length - 1)){
                polyCoordString += ("[" + coordLon + "," + coordLat + "]");
            } else {
                polyCoordString += ("[" + coordLon + "," + coordLat + "],");
            }
        }
        polyCoordString += "]";
        
        client.attributeEditor.find('select').html('');
        for(var i=0; i < client.project.data.editableFields[client.activeProject].polygons.length;i++){
            client.attributeEditor.find('select')
                .append(
                    $('<option />')
                        .html(client.project.data.editableFields[client.activeProject].polygons[i])
                );
        }
        
        client.attributeEditor
            .css({
                top: y - 120 + 'px',
                left: x - (client.attributeEditor.width()/2) + 'px'
            })
            .fadeIn();
        
        client.contextMenu.html('')
            .append(
                $('<div />')
                    .html('')
                    .attr('id', 'projectDataAttributes')
            )
            .append(
                $('<div />')
                    .html('Shape: '+ "Polygon")
                    .attr('coords', polyCoordString)
                    .addClass('shape unEditable')
            )
            .append(
                $('<div />')
                    .html('Latitude: '+lat)
                    .addClass('lat unEditable')
            )
            .append(
                $('<div />')
                    .html('Longitude: '+lon)
                    .addClass('lon unEditable')
            )
            .append(
                $('<div />')    
                    .html('Created: '+ (function(){ return new Date()})())
                    .addClass('date unEditable')
            )
            .css({
                top: y + 10 + 'px',
                left: x - (client.contextMenu.width()/2) + 'px'
            })
            .dblclick(function(){
				try{
	                markerList[markerList.length-1].setMap(null);
	                polyShapes[polyShapes.length-1].setMap(null);
	                client.editorData.polygons.shape.setMap(null);
	                client.editorData.polygons.length = 0;
				} catch (err){
					console.log(err)
				}
                client.contextMenu.fadeOut();
                client.attributeEditor.fadeOut();
            })
            .fadeIn(function(){
                client.attributeEditor.find('select').focus();
                var clickPosition = new google.maps.LatLng(lat, lon);
                
                (function(){
                    var marker = new google.maps.Marker({
                        map     : map,
                        title   : client.id + "_marker_" + String(new Date().getTime()),
                        position: clickPosition,
                        icon    : 'images/map_icon_editingLines.png',
                        animation: google.maps.Animation.DROP
                    });
                    markerList.push(marker);
                })();
                
                if(client.editorData.polygons.shape) {client.editorData.polygons.shape.setMap(null)}
                (function(){
                    var polygonMarker = new google.maps.Polygon({
                        path: polygonCoordinates,
                        fillColor: "#000",
                        fillOpacity: .5,
                        strokeWeight: 0,
                        //editable: true,
                        map: map
                    });
                    polygonMarker.coords = polygonCoordinates;
                    polyShapes.push(polygonMarker);
                    polygonCoordinates.length = 0;
                })();
            });
    }
    
    function geocode(options){
        var geocodeLatLng = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        options.lat + ',' + options.lon + '&sensor=false';
        $.ajax({
            url: geocodeLatLng ,
            complete: function(data){
                var address = '';
                var location = '';
                try{
                    address = $.parseJSON(data.responseText).results[0].formatted_address;
                    location = $.parseJSON(data.responseText).results[0].geometry.location;
					queryCensus({
						address_components: $.parseJSON(data.responseText).results[0].address_components
					});
                } catch (err){
                    address = 'No Address Available';
                    location = 'No Location Data';
                    console.log(err);
                }
                if(options.callback instanceof Function){
                    options.callback({
                        address :address,
                        location:location
                    });
                }
            }
        });
    }
	function queryCensus(options){
		var censusKey = '40a068a9dea2d53cef52e037656657fa1054745b';
		var censusStatePopQueryURL = 'http://api.census.gov/data/2010/sf1?key='+ censusKey +'&get=P0010001,NAME&for=state:*';
		var geocodeInfo = [];
		geocodeInfo.validAddress = false; // locations outside of US invalid for US census.
		
		for(var j=0;j<options.address_components.length;j++){
			var isUSAddress = options.address_components[j].long_name == "United States" ? true: false;
			geocodeInfo.push({
				state:options.address_components[j].long_name
			});
			if(isUSAddress){
				geocodeInfo.validAddress = true;
			}
		}
		
		if(!geocodeInfo.validAddress) return;
		$.ajax({
			url: censusStatePopQueryURL,
			complete: function(data){
				try{
					var responseJSON = $.parseJSON(data.responseText)
					var censusStates = [];

					for(var i=1; i < responseJSON.length; i++){
						var censusStateInfo = {
							state:responseJSON[i][1],
							pop:responseJSON[i][0]
						}
						censusStates.push(censusStateInfo);
					}
					
					console.log(censusStates, geocodeInfo, geocodeInfo.validAddress);
				} catch (err) {
					console.log('Census Query Error', err);
				}
			}
		});
	
	}
});
