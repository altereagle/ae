// vins variables
var imagename = "sitesignature.png";
var imageSettings = {
    height: "86px",
    width: "275px"
};

$(function () {
    var app = $('body');
    var client = {};
    
    client.splashImage = (function(){
       var div = $('<img />')
            .attr('id','logo')
            .attr('src','images/' + imagename)
            .css(imageSettings)
            .appendTo(app);
       return div;
    })();
    centerElement(client.splashImage);
    
    function centerElement(element) {
        console.log(element.width(),$(document).width())
        var x = $(document).width() / 2 - (element.width()/2) - (parseInt(element.css("padding"), 10) / 2);
        var y = $(document).height() / 2 - (element.height()/2) - (parseInt(element.css("padding"), 10) / 2);
        element.css({
            position: "absolute",
            left: x,
            top: y
        });
    }
    
});		