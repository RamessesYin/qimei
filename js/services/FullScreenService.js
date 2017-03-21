/**
 * Created by William on 2016/8/29 0016.
 * Modified by Ramesses on 2016 9/3
 */

app.factory('FullScreen',['RESTClient','URL',function(RESTClient,URL){

    var self={};
    var enterFullScreen=[];
    var exitFullScreen=[];

    var enter=function()
    {
        for(var i=0;i<enterFullScreen.length;i++)
        {
            enterFullScreen[i]();
        }
    }

    var exit = function()
    {
        for(var i=0;i<exitFullScreen.length;i++)
        {
            exitFullScreen[i]();
        }
    }

    var listen=function()
    {
        document.addEventListener("fullscreenchange", function(e) {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            fullscreenElement? enter():exit();
        });
        document.addEventListener("mozfullscreenchange", function(e) {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            fullscreenElement? enter():exit();
        });
        document.addEventListener("webkitfullscreenchange", function(e) {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            fullscreenElement? enter():exit();
        });
        document.addEventListener("msfullscreenchange", function(e) {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            fullscreenElement? enter():exit();
        });
    }

    self.addEnter=function(fun)
    {
        enterFullScreen.push(fun);
    }

    self.addExit=function(fun)
    {
        exitFullScreen.push(fun);
    }

    listen();
   
    return self;
}]);


