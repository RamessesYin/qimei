/**
 * Created by William on 2016/3/18 0018
 * Modified by Ramesses on 2016 8/9
 */

var app=angular.module(PROJECT);



/**
 * 统一restful api请求
* */

app.factory('RESTClient', ['$http', '$q', function($http, $q){
    var self=

    {

        responseCode:0,

        getResource: function(url,data){
            var defer = $q.defer();
            var str='';
            for(var p in data)
            {
                str+=(p+'='+data[p]+"&");
            }
            if(str!='')
            {
                str.substring(0,str.length-1);
                str='?'+str;
            }
            $http.get(url+str)
            .then(function(res){
                defer.resolve(res.data);
            }, function(res){
                defer.reject(res.data);
            });
            return defer.promise;
        },


        addResource: function(url, data){
            var defer = $q.defer();
            $http.post(url,data)
                .then(function(res){
                    defer.resolve(res.data);
                }, function(res){
                    defer.reject(res.data);
                });
            return defer.promise;
        },

        deleteResource: function(url){
            var defer = $q.defer();
            $http.delete(url)
            .then(function(res){
                defer.resolve(res.data);
            }, function(res){
                defer.reject(res.data);
            });
            return defer.promise;
        },

        deleteDataResource: function(url,data){
            var defer = $q.defer();
            $http.delete(url,{
                data:data
            })
            .then(function(res){
                defer.resolve(res.data);
            }, function(res){
                defer.reject(res.data);
            });
            return defer.promise;
        },


        updateResource: function(url, data){
            var defer = $q.defer();
            $http.put(url,data)
            .then(function(res){
                log(res);
                
                defer.resolve(res.data);
            }, function(res){
                defer.reject(res.data);
            });
            return defer.promise;
        }

    }

    return self;

}]);



app.factory('Category',function(RESTClient,URL){

    var self={};

    //可以考虑之后从后台获取数据
    self.category=
        [
            {'_id':1,'name':'电视剧','list':[]},
            {'_id':2,'name':'时尚','list':[]},
            {'_id':3,'name':'电影','list':[]}, 
            {'_id':7,'name':'体育','list':[]},
            {'_id':8,'name':'新闻','list':[]},
            {'_id':9,'name':'纪录片','list':[]}, 
            {'_id':10,'name':'访谈录综艺','list':[]},

        ];

    self.fullList=[];

    if(!ENV.PROD && false)
    {
        $.getJSON("json/home.json", function(data)
        {
            if(data)
            {
                for (var i=0;i<data.list.length;i++)
                {
                   var remark=data.list[i].remark;
                   if(data.list[i].state!=10) continue;
                   self.category[remark].push(data.list[i]);
                }

            }
        });
    }
    else
    {
        RESTClient.getResource(URL.REQUEST+"programs")
            .then(function(data)
            {
                log(data);
                if(data)
                {
                    //data=data.programs;
                    for (var i=0;i<data.programs.length;i++)
                    {
                       var remark=data.programs[i].type;
                       remark=Number(remark);
                       if(remark<4)
                       {
                           remark=remark-1;
                       }
                       else if(remark>6)
                       {
                           remark=remark-4;
                       }
                       self.category[remark].list.push(data.programs[i]);
                    }
                    log(self.category);

                }
            });
    }

    self.getListById=function(_id)
    {
        console.log("getListById:"+_id);
        console.log(self.category[_id-1]);
        return self.category[_id-1];
    }


    return self;

});

