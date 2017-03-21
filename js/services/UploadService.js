/**
 * Created by Ramesses on 2016/9/3
 */

var app=angular.module(PROJECT);


app.factory('Upload', ['$http', '$q', function($http, $q){
    //var self={};

    var postMultipart=function(url, data) {
        log(url);
        var fd = new FormData();
        angular.forEach(data, function(val, key) {
            fd.append(key, val);
        });
        var args = {
            method: 'POST',
            url: url,
            data: fd,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        };  
        return $http(args);
    }

    return {
        file:postMultipart
    };
}]);
