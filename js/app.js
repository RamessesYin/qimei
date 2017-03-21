/**
 * Created by William on 2016/3/18
 * Modified by Ramesses on 2016/7/28
 */

'use strict';

//是否为生产环境
var ENV={
    PROD : 0
};

var PROJECT='edit';

var app = angular.module(PROJECT, ['ui.router']);



//定义有关url的常量
app.constant("URL", {
    "BASE"   : "/",
    "REQUEST": "http://202.120.39.165:23300/v1.0/",
    "FILE": "http://202.120.39.165:2331"
});

//定义有关请求状态的常量
app.constant("REQUEST", {
    "UPDATE"   : {SUCCESS:'200'}
});

//http://202.120.39.166:8085/VideoInfo/qimei/testOnline/img/img-play.png

app.config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl as home',
            onEnter: function($rootScope,URL){
                $rootScope.pageName='home';
                $rootScope.showMode=true;
                $rootScope.addState=1;
                $rootScope.FILE_URL=URL.FILE;
            },
            onExit: function($rootScope){
                $rootScope.showMode=false;
            }
        })
        .state('category', {
            url: '/category/:cateId',
            templateUrl: 'partials/category.html',
            controller: 'CategoryCtrl as category',
            onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                $rootScope.pageName='category';
                $rootScope.addState=0;

            }
        })
        .state('brief', {
            url: '/brief/:programId',
            templateUrl: 'partials/brief.html',
            controller: 'BriefCtrl as brief',
            onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                $rootScope.pageName='brief';
                  $rootScope.addState=0;

            }
        })
        .state('edit', {
            url: '/edit/:programId/:episodeId',
            templateUrl: 'partials/edit.html',
            controller: 'EditCtrl as edit',
            onEnter: function($rootScope){
                $rootScope.pageName='edit';
                  $rootScope.addState=0;

            },
            onExit: function($rootScope){
                $rootScope.pageName=null;
           
            }
        })
        .state('match', {
            url: '/match/:programId',
            templateUrl: 'partials/match.html',
            controller: 'MatchCtrl as match',
            onEnter: function($rootScope){
                $rootScope.pageName='match';
                  $rootScope.addState=0;

            },
            onExit: function($rootScope){
                $rootScope.pageName=null;
           
            }
        })

       



        .state('detail', {
            url: '/detail/:programId/:episodeId',
            templateUrl: 'partials/detail.html',
            controller: 'DetailCtrl as detail',
           onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                  $rootScope.pageName='detail';
                  $rootScope.curMode=3;
                    $rootScope.addState=0;

            }
        })

         .state('video', {
            url: '/video/:programId/:episodeId',
            templateUrl: 'partials/video.html',
            controller: 'VideoCtrl as video',
            onEnter: function($rootScope){
                $rootScope.pageName='video';
                  $rootScope.addState=0;

            },
            onExit: function($rootScope){
                $rootScope.pageName=null;

            }
        })

        .state('item', {
            url: '/item/:programId/:episodeId',
            templateUrl: 'partials/item.html',
            controller: 'ItemCtrl as item',
             onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                  $rootScope.pageName='item';
                    $rootScope.addState=0;

            }

        })
           .state('itemShow', {
            url: '/itemShow/:programId',
            templateUrl: 'partials/itemShow.html',
            controller: 'ItemShowCtrl as itemShow',
             onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                  $rootScope.pageName='itemShow';
                    $rootScope.addState=0;

            }

        })
        .state('object', {
            url: '/object/:programId/:episodeId',
            templateUrl: 'partials/object.html',
            controller: 'ObjectCtrl as object',
             onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                  $rootScope.pageName='object';
                    $rootScope.addState=0;

            }
        })
        .state('show', {
            url: '/show/:programId/:episodeId',
            templateUrl: 'partials/show.html',
            controller: 'ShowCtrl as show',
            onEnter: function($rootScope,URL){
                $rootScope.FILE_URL=URL.FILE;
                $rootScope.pageName='show';
                  $rootScope.addState=0;

            },
            onExit: function($rootScope){
                $rootScope.pageName=null;
           
            }
        });
});


app.run(['$state', function($state,$rootScope){
    //$rootScope.FILE_URL='http://202.120.39.165:2331';
    $state.go('home');
}]);


var DEBUG=true;

function log(msg)
{
    if(DEBUG)
    {
        console.log(msg);
    }
}

function prompt(p)
{
    alert(p);
}

function getRandom(min , max)
{
    var range=max-min;
    var rand=Math.random();
    return (min+Math.round(rand*range));
}


function sleep(n) {
    var start = new Date().getTime();
    log(start);
    while(true)  if(new Date().getTime()-start > n) break;
}



