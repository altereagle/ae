
$(function () {
    var app = $('body');
    var client = {};
    
    client.DELETEME = (function(){
       var div = $('<div />')
            .attr('id','supbro')
            .html('This font makes comic sans look good. Find a better one, or this is going to be the default. ')
            .append(
                $('<a />')
                    .html('How do you know this wont take you to Live Jasmine?')
                    .attr('href', 'http://www.google.com/webfonts')
            )
            .appendTo(app);
       return div;
    })();
    
});		