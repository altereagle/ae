$(function(){
    //var client = io.connect(window.location.host);
	var client = io.connect(':4005');
    var app = $('body');
	client.chatBox = (function(){
		var chatBox = $('<input />')
			.attr('type', 'text')
			.attr('id', 'chatBox')
			.addClass('fancyChatStyle')
			.focus(function() {
				$(this).val('');
				app.trigger('client_typing', true);
			})
			.keypress(function (event) {
				if (event.charCode !== 13) return;
				if(chatBox.val().indexOf('bug:') === 0){
					client.emit('bug_report',{
						from: client.user_id, // secure
						bug: chatBox.val().split('bug:')[1], // secure
					})
					$(this).val('');
					$(this).blur();
					app.trigger('client_typing', false);
					alert('Bug has been reported, thank you!');
					return;
				}
				console.log(client.project.list,client.activeProject);
				client.emit('send_chat_message', {
					from: client.username, // secure
					message: chatBox.val(), // secure
					project_id: client.project.list[client.activeProject]
				});
				
				$(this).val('');
				$(this).blur();
				app.trigger('client_typing', false);
			})
			.appendTo($('body'));
		return chatBox;
	})();
    
    client.on('recieve_chat_message', function(sender) {
		if(sender.project_id != client.project.list[client.activeProject])return;
        $('.oldMessage').animate({
          top: "100px",
          opacity: 0
        }, 5000, function() {
          $(this).remove();
        });
        
        var div = $('<div />')
          .attr('id', 'chatMessage')
          .addClass('oldMessage')
          .html(sender.from + ' says, '+sender.message)
          .appendTo($('body'));
          
        setTimeout(function() {
            div.fadeOut(function() {
                $(this).remove();
            });
        }, 10000);
    });
});
