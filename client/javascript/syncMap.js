$(function(){
    //var client = io.connect(window.location.host);
	var client = io.connect(':4005');
    var map = client.map;
    
	client.mapSyncToggler = (function(){
		var toggleButton = $('<button />')
			.attr('id', 'syncToggler')
			.html('Following')
			.click(function(){
				if(client.mapViewSynced){
					client.mapViewSynced = false;
					$(this).html('Following')
				} else {
					client.mapViewSynced = true;
					$(this).html('Leading')
				}
			})
			.appendTo($('body'));
			
		return toggleButton;
	})();
    google.maps.event.addListener(map, 'dragend', function () {
        if(client.isEditing || 	!client.mapViewSynced) return;
        client.emit('sync_map', {
            user_id : client.user_id,
            project_id : client.project.list[client.activeProject-1],
            lat : map.getCenter().Ya,
            lon : map.getCenter().Za,
            zoom: map.getZoom(),
            mapType : map.getMapTypeId()
        });
    });
    
    client.on('sync_map', function(sender){
		var same_user_id = sender.user_id == client.user_id;
		var same_project_id = sender.project_id == client.project.list[client.activeProject-1]; // only syncs first project
		if(!same_user_id && same_project_id){
	        map.panTo(new google.maps.LatLng(sender.lat, sender.lon));
	        map.setZoom(sender.zoom);
	        map.setMapTypeId(sender.mapType);
		}
    });
});