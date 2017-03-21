/**
 * Created by Ramesses on 2016/9/3
 */

var app=angular.module(PROJECT);


app.factory('Tool',function($http, $q){
    var self={};

    self.getBase64Image=function(url)
    {
    	var canvas = document.createElement("canvas");
    	canvas.width = img.width;
    	canvas.height = img.height;

    	var ctx = canvas.getContext("2d");
    	ctx.drawImage(img, 0, 0);


    	var dataURL = canvas.toDataURL("image/png");

    	return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    return self;
});
