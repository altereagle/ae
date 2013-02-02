$(function(){
    //var client = io.connect(window.location.host);    
	var client = io.connect(':4005');
	var app = $('body');
	client.userLogin = (function(){
		var div = $('<div />')
			.attr('id', 'userLogin')
			.append(
				$('<input />')
					.attr('type', 'text')
					.attr('id','userName')
			)
			.append(
				$('<input />')
					.attr('type', 'password')
					.attr('id','userPassword')
			)
			.appendTo($('body'));
			
			client.tools.centerElement(div);
		return div;
	})()
	
	client.on('new_user',function(data){
		var userName = app.find('#userName');
		var userPassword = app.find('#userPassword');

		userName
			.val(data.username)
			.focus(function(){
				app.trigger('client_typing', true);
				$(this).val('');
			})
			.keypress(function (event) {
	            if (event.charCode !== 13) return;
				$(this).blur();
				userPassword.focus();
	            app.trigger('client_typing', false);
	        });
		userPassword
			.val('password')
			.focus(function(){
				app.trigger('client_typing', true);
				$(this).val('');
			})
			.keypress(function (event) {
	            if (event.charCode !== 13) return;
				$(this).blur();
				client.username = userName.val();
				client.emit('login',{
					username: userName.val(),
					password: userPassword.val()
				})
				$(this).val('');
	            app.trigger('client_typing', false);
	        });
	})
	
})