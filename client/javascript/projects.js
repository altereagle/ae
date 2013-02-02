$(function () {
  //var client = io.connect(window.location.host);
	var client = io.connect(':4005');
	var app = $('body');
	client.wizardStepCount = 0; // Starting Global for the wizard steps and the wizard steps themselves
	client.projectWizardInput = [];
	client.wizardSteps = [
		'Enter a name for your project, and press [enter] to continue.'
		,'Please enter a brief description of your project, press [enter] to continue.'
		,'If there are any administrators other than yourself, please enter their username '+
				'or usernames seperated by commas, then press [enter] to continue.'
		,'Enter Tags (one word or words seperated by commas), then press [enter] to continue!'
	];
	client.projectOptions = (function(){
		var img = $('<img />')
			.attr('id', 'projectOptions')
			.attr('opened', 0)
			.attr('src','images/project_wizard_off.png')
			.dblclick(function(event){
				$(this).animate({top:'35px'})
					.attr('opened', 0)
					.effect("fold",function(){
						$(this)
							.attr('src','images/project_wizard_off.png')
							.show()
							.mouseover(function(){
								if($(this).attr('opened') == 1) return;
								$(this).attr('src','images/project_wizard_on.png')
								$(this).stop();
								$(this).animate({top: '45px'})
							})
							.mouseout(function(){
								if($(this).attr('opened') == 1) return;
								$(this).attr('src','images/project_wizard_off.png')
								$(this).stop();
								$(this).animate({top: '30px'})
							});
					});
							
				$('.project_wizard').effect('explode',function(){
					$('.project_wizard').remove();
					client.wizardStepCount = 0;
				});
			})
			.click(function(event){
				if(client.wizardStepCount != 0) return;
				event.stopPropagation();
				$(this).attr('opened', 1);
				$(this).animate({top: '250px'},function(){

					$(this).attr('src','images/project_open.png')
					$('<div />')
						.attr('id','project_wizard')
						.addClass('project_wizard')
						.effect('highlight',function(){
							$(this).append(
								$('<textarea />')
										.addClass('project_info')
										.val((function(){
											try{
												var firstStep = client.wizardSteps[client.wizardStepCount];
											} catch(err){
												console.log(err) // end of the list!
											}
											client.wizardStepCount++;
											return firstStep;
										})())
										.focus(function(){
											if(client.wizardStepCount-1 == client.wizardSteps.length){
												$(this).attr('readonly',true);
												$(this).blur();
												return;
											}
											$(this).val('')
                        					app.trigger('client_typing', true);
										})
										.keypress(function(event){
					                        if(event.charCode !== 13) return;
											if(client.wizardStepCount-1 == client.wizardSteps.length){
												return;
											}
											client.projectWizardInput.push($(this).val());
					                        $(this).blur();
					                        $(this).effect('transfer',{
					                            to: "#projectOptions",
					                            className: "project_input_submit"
					                        },function(){
					                            $(this).val(client.wizardSteps[client.wizardStepCount])
														
														if(client.wizardStepCount == client.wizardSteps.length){
															var done_message = 'Okay, that\'s all you will need for now.'
															$(this).val(done_message)
															
															setTimeout(function(){
																$('#projectOptions').trigger('submit_project');
															},3000)
															
														}
														client.wizardStepCount++;
					                        });
					                        app.trigger('client_typing', false);
										})
										.blur(function(){
											app.trigger('client_typing', false)
										})
								);
						})
						.appendTo($('body'));
				});
				
				
			})
			.on('submit_project', function(event){
				$('.project_wizard').effect('puff',function(){
					$('.project_wizard').remove();
					client.wizardStepCount = 0;
				});
				var done_message = 'Move the map to the area that your project will cover, then [click] on the black box up here to create it!';
				if(client.username === null) {
					done_message = "Sorry, it appears you are not logged in, only registered users can create a project. [click] on the black box to try again.";
				}
				$('<div/>')
					.attr('id','projectReadyMessage')
					.html(done_message)
					.appendTo($('body'))
					.effect('slide',function(){
						setTimeout(function(){
							$('#projectReadyMessage').effect('drop',function(){
								$(this).remove();
							});
						},7000);
					})
					.click(function(){
						$('#projectReadyMessage').effect('drop',function(){
							$(this).remove();
						});
					});
					
				$(this)
					.attr('opened', 1)
					.attr('src','images/project_closed.png')
					.one('click',function(){
						$(this)
							.attr('opened', 0)
							.effect("fold",function(){
								$(this)
									.attr('src','images/project_wizard_on.png')
									.show();
								if(!client.username) return; // If the user is not logged in do not submit project
								var wizardData = {};
								for(var i=0;i< client.projectWizardInput.length; i++){
									var fieldName = client.project.data.wizardFieldNames[i];
									var fieldValue = client.projectWizardInput[i];
									wizardData[fieldName] = fieldValue;
								}
								wizardData.project_owner = client.username;
								wizardData.user_id = client.user_id;
								wizardData.project_lat = client.map.getCenter().Ya;
								wizardData.project_lon = client.map.getCenter().Za;
								wizardData.project_zoom = client.map.getZoom();
								wizardData.project_map_type = client.map.getMapTypeId();
								client.projectWizardInput.length = 0;
								
								client.emit('add_new_project',wizardData)
							})
							.stop()
							.animate({top: '30px'})
					})
					.stop()
					.animate({top: '30px'})
			})
			.mouseover(function(){
				if($(this).attr('opened') == 1) return;
				$(this).attr('src','images/project_wizard_on.png')
				$(this).stop();
				$(this).animate({top: '45px'})
			})
			.mouseout(function(){
				if($(this).attr('opened') == 1) return;
				$(this).attr('src','images/project_wizard_off.png')
				$(this).stop();
				$(this).animate({top: '30px'})
			})
			.appendTo($('body'));
		return img;
	})();
	client.on('sync_user_projects', function (sender) {
		if (sender.user_id) {
			client.user_id = sender.user_id; // assign user_id to global
			client.username = sender.username // asign username to the global
			client.emit('get_user_projects', {
				user_id: sender.user_id,
				username: sender.username
			});
      		client.userLogin.fadeOut();
			client.projectOptions.fadeIn();
			client.chatBox.val('Welcome back '+ client.username.split('@')[0] +', [click] on the wizard to create a project.')
			client.chatBox.fadeIn();
			client.showFeatureQueueButton = (function(){ // This is temporary!!
				var button = $('<button />')
					.attr('id','showFeatureQueueButton')
					.html('Show Features: (button here only while debugging)')
					.appendTo($('body'))
					.click(function(){
						app.trigger('show_feature_queue');
					});
				return button;
			})();
			
			return;
		}
	});

	client.on('recieve_user_projects', function (sender) {

		client.project.list = sender.project_ids; // assign project_ids to global
		for(var i=0;i<sender.project_ids.length;i++){
			client.emit('download_user_projects', {
				username: client.username,
				user_id: client.user_id,
				project_id: sender.project_ids[i]
	    	});
		}
	});

	client.on('download_user_projects', function (sender) {
	// Pan map to project center **** THIS FUNCTION WILL REQUIRE FIXING WITH MULTIPE PROJECTS LOADING
		// set globals
		var projectInfo = {
			center: new google.maps.LatLng(parseInt(sender.project_lat, 10), parseInt(sender.project_lon, 10)),
			zoom: parseInt(sender.project_zoom, 10),
			project_name: sender.project_name // assign project name global
		};
		client.project.info.push(projectInfo);
		
		client.emit('get_project_fields', {
			username: sender.username,
			user_id: sender.user_id,
			project_id: sender.project_id
		});
    	client.emit('get_project_features', {
			username: sender.username,
			user_id: sender.user_id,
			project_id: sender.project_id
	    });
	});

  	client.on('recieve_project_fields', function (sender) {
		var senderAttributes;
		var senderFieldLabels;
		try{
			senderAttributes = {
				markers: sender.label_point.split(','),
				polylines: sender.label_line.split(','),
				polygons: sender.label_poly.split(',')
			};
			senderFieldLabels = {
				markers: sender.type_point,
				polylines: sender.type_line,
				polygons: sender.type_poly
			};
		} catch (err){
			// If there are no labels, this is where field creation should be triggered.
			senderAttributes = {
				markers: ['No Label'],
				polylines: ['No Label'],
				polygons: ['No Label']
			}
			senderFieldLabels = {
				markers: "Point",
				polylines: "LineString",
				polygons: "Polygon"
			}
			console.log('Project has no fields or labels trigger field/label creation for that project!');
		}
		client.project.data.editableFields.push(senderAttributes);
		client.project.data.editableFieldsLabels.push(senderFieldLabels);
	});
	
 	client.on('recieve_project_features', function (data) {
		// Only parses geoJSON Point, LineString, and Polygon
    	if (client.features.length !== 0) {
	      	for (var c = 0; c < client.features.length; c++) {
		        client.features[c].setMap(null); // remove old features from map
			}
			client.features.length = 0;
    	}
		client.featureQueue.push(data);
	});
	
	app.on('show_feature_queue',function(sender) { // This is still a work in progress
		var data = client.featureQueue;
		for(var q=0; q < data.length; q++){
		var projectFeatures = data[q].features;
		for (var i = 0; i < projectFeatures.length; i++) {
		var feature = $.parseJSON(projectFeatures[i].geo_json).features;

      for (var j = 0; j < feature.length; j++) {
        if (!feature[j]) continue;
        var geometry = feature[j].geometry;
        var properties = feature[j].properties; // Add Properties after edits are loaded
        if (geometry.type === "Point") {
          var position = new google.maps.LatLng(geometry.coordinates[1], geometry.coordinates[0]);
          (function () {
            var marker = new google.maps.Marker({
              map: client.map,
              title: client.id + "_marker_" + String(new Date().getTime()),
              position: position,
              icon: 'images/map_icon.png',
              animation: google.maps.Animation.DROP
            });
            client.features.push(marker);

            var infowindow = new google.maps.InfoWindow({
              content: (function () {
                var attributes = $('<div />')
                  .attr('id','infowindowAttributes');
                for (name in properties) {
                  attributes.append(
                  $('<div />')
                    .addClass('attribute')
                    .append($('<div />').addClass('name').html(name))
                    .append($('<div />').addClass('value').html(properties[name])));
                }
                return attributes[0];
              })()
            });
            google.maps.event.addListener(marker, 'click', function () {
              infowindow.open(client.map, marker);
            });
            client.editorData.infoWindows.push(infowindow);


          })();
        } else if (geometry.type === "LineString") {
          (function () {
            var polyLineMarker = new google.maps.Polyline({
              path: (function () {
                var position = [];
                for (var k = 0; k < geometry.coordinates.length; k++) {
                  var coord = new google.maps.LatLng(geometry.coordinates[k][1], geometry.coordinates[k][0]);
                  position.push(coord);
                }
                return position;
              })(),
              strokeOpacity: 1,
              icons: [{
                offset: '0',
                repeat: '20px'
              }],
              map: client.map
            });
            client.features.push(polyLineMarker);

            var marker = new google.maps.Marker({
              map: client.map,
              title: client.id + "_marker_" + String(new Date().getTime()),
              position: new google.maps.LatLng(geometry.coordinates[geometry.coordinates.length - 1][1], geometry.coordinates[geometry.coordinates.length - 1][0]),
              icon: 'images/map_icon.png',
              animation: google.maps.Animation.DROP
            });
            client.features.push(marker);

            var infowindow = new google.maps.InfoWindow({
              content: (function () {
                var attributes = $('<div />')
                  .attr('id','infowindowAttributes');
                for (name in properties) {
                  attributes.append(
                  $('<div />')
                    .addClass('attribute')
                    .append($('<div />').addClass('name').html(name))
                    .append($('<div />').addClass('value').html(properties[name])));
                }
                return attributes[0];
              })()
            });
            google.maps.event.addListener(marker, 'click', function () {
              infowindow.open(client.map, marker);
            });
            client.editorData.infoWindows.push(infowindow);
          })();
        } else if (geometry.type === "Polygon") {
          (function () {
            var polygonMarker = new google.maps.Polygon({
              path: (function () {
                var position = [];
                for (var k = 0; k < geometry.coordinates.length; k++) {
                  var coord = new google.maps.LatLng(geometry.coordinates[k][1], geometry.coordinates[k][0]);
                  position.push(coord);
                }
                return position;
              })(),
              fillColor: "#000",
              fillOpacity: .5,
              strokeWeight: 0,
              map: client.map
            });
            client.features.push(polygonMarker);

            var marker = new google.maps.Marker({
				map: client.map,
				title: client.id + "_marker_" + String(new Date().getTime()),
				position: new google.maps.LatLng(geometry.coordinates[geometry.coordinates.length - 1][1], geometry.coordinates[geometry.coordinates.length - 1][0]),
				icon: 'images/map_icon.png',
				animation: google.maps.Animation.DROP
            });
            client.features.push(marker);

            var infowindow = new google.maps.InfoWindow({
              content: (function () {
                var attributes = $('<div />')
                  .attr('id','infowindowAttributes');
                for (name in properties) {
                  attributes.append(
                  $('<div />')
                    .addClass('attribute')
                    .append($('<div />').addClass('name').html(name))
                    .append($('<div />').addClass('value').html(properties[name])));
                }
                return attributes[0];
              })()
            });
            google.maps.event.addListener(marker, 'click', function () {
              infowindow.open(client.map, marker);
            })
            client.editorData.infoWindows.push(infowindow);
          })();
        } else {
          return;
        }
      }
    }
	}
	// client.featureQueue.length = 0; // This is buggy as hell
  });
})