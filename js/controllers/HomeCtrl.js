/**
 * Created by William on 2016/3/18
 * Modified by Ramesses on 2016 9/3
 */
var app = angular.module(PROJECT);


app.controller('HomeCtrl',function($scope,$rootScope,$http,RESTClient,Category,$state,URL)
{
	$scope.sourceUrl=URL.RESOURCE;

    $scope.category=Category.category;

    $scope.videoRecord={};

    $scope.more = function (id)
    {
        $state.$state.go('category',{cateId:id});
    }

    $scope.toBrief=function (id)
    {
       
        if($rootScope.curMode==3)
        {
            $state.go('itemShow',{programId:id});
        }
        else if($rootScope.curMode==4)
        {
            $state.go('match',{programId:id});
        }
        else
        {
             $state.go('brief',{programId:id});
        }
    }

        
   

    $scope.addVideoRecord=function(video)
    {
        log(video);
        if(video.remark==null || video.remark.length==0)
        {
            prompt('请输入文件名！');
        }

        RESTClient.addResource(URL.REQUEST+'new_program',video)
            .then(
            function(data)
            {
                $("#addVideoRecordModal").modal('hide');
                //$state.reload();
                //$state.go('brief',{programId:_id});
            },
            function(data)
            {
                //log(data);
                prompt(data.message);
                /*if(data.status==404)
                    prompt('该文件不存在！');
                else if(data.status==409)
                    prompt('视频集信息已存在！');*/
            });
    }

});
