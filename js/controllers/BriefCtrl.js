/**
 * Created by William on 2016/3/18
 * Modified by Ramesses on 2016 8/15
 */

var app = angular.module(PROJECT);

app.controller('BriefCtrl',function($scope,$rootScope,URL,RESTClient,$timeout,$state,$stateParams,REQUEST,$rootScope)
{
    $scope.editProgramInfo=new Object();
    $scope.stateInfo=['已上传','待完成','已完成'];
    $scope.states=null;
    $scope.selected=[];
  var programId=$stateParams.programId;


    $rootScope.proId=programId;
    var cronUpdate=null;

    var _id=$stateParams.programId;

    

    RESTClient.getResource(URL.REQUEST+"program/"+_id)
        .then(function (data){

            $scope.programInfo=data.programinfo;
            $scope.editProgramInfo=$scope.programInfo;
            //$scope.episodes=$scope.programInfo.video_id;
        });

    var getState=function(){
        RESTClient.getResource(URL.REQUEST+"videos",{program_id:_id})
        .then(function (data){
            $scope.episodes=data.videos;
            var check=0;
            for(var i=0;i<$scope.episodes.length;i++)
            {
                  if($scope.episodes[i].state==0)
                  {
                    check=1;
                    break;
                  }
            }
            if(check==1&&$rootScope.curMode==4)
            {

            cronUpdate=$timeout(function(){
                getState();
            },10000);
            }

        });
    }
           getState();
 
    


    $scope.showEditBriefModal=function()
    {
        $scope.editProgramInfo={
            abstract:$scope.programInfo.abstract,
            director:$scope.programInfo.director,
            actor:$scope.programInfo.actor,
        }

        $("#editBriefModal").modal();
    }

    $scope.updateSelection = function($event, id){
        var checkbox = $event.target;
        var action = (checkbox.checked?'add':'remove');

        if(checkbox.checked && $scope.selected.indexOf(id) == -1){
            $scope.selected.push(id);
        }
        if(!checkbox.checked && $scope.selected.indexOf(id)!=-1){
            var idx = $scope.selected.indexOf(id);
            $scope.selected.splice(idx,1);
        }
    }

    $scope.updateProgramInfo=function(programInfo)
    {
        RESTClient.updateResource(URL.REQUEST+'program/'+_id,$scope.editProgramInfo)
            .then(function(data){
                angular.extend($scope.programInfo,$scope.editProgramInfo);
                $("#editBriefModal").modal('hide');
            });
    }

    $scope.addEpisode=function(video)
    {
        video.program_id=_id;
        RESTClient.addResource(URL.REQUEST+'videos',video)
            .then(function(data){
                $state.reload();
            });
    }

    $scope.showAddEpisodeModal=function()
    {
        $scope.addEpisodeInfo={};
        $("#addEpisodeModal").modal();
    }


    //console.log($scope.tvInfo.movieId);
    $scope.ToPlay=function (id) 
    {
        if($rootScope.curMode==0)
        {
            window.open("index.html#show/"+$scope.programInfo.program_id+'/'+id);
        }
        else if($rootScope.curMode==4)
        {
            window.open("index.html#match/"+$scope.programInfo.program_id+'/'+id);
        }
        else if($rootScope.curMode==2)
        {
            window.open("index.html#video/"+$scope.programInfo.program_id+'/'+id);
        }
     
         else if($rootScope.curMode==3)
        {
            window.open("index.html#item/"+$scope.programInfo.program_id+'/'+id);
        }
        
    }

    $scope.ToPlayFirst=function()
    {
        if($scope.episodes.length==0)
        {
            prompt('不存在可播放文件!');
        }

        var id=$scope.episodes[0].video_id;

        if($rootScope.curMode==0)
        {
            window.open("index.html#show/"+$scope.programInfo.program_id+'/'+id);
        }
        else if($rootScope.curMode==1)
        {
            window.open("index.html#edit/"+$scope.programInfo.program_id+'/'+id);
        }
    }

    $scope.updateState=function()
    {
        if($scope.selected.length==0)
        {
            prompt('请至少选择一集！');
            return ;
        }
        var data="";
        for(var i=0;i<$scope.selected.length-1;i++)
        {
            data+=$scope.selected[i]+",";
        }
        data+=$scope.selected[$scope.selected.length-1];

        RESTClient.updateResource(URL.REQUEST+"video_state",{video_list:data,video_state:'1'})
            .then(function (data){
                prompt('提交成功!');
                for(var i=0;i<$scope.episodes.length;i++)
                {
                    if($scope.selected.indexOf($scope.episodes[i].video_id)!=-1)
                    {
                        $scope.episodes[i].state=1;
                    }
                }
            });
    }


    $scope.toRelManagerPage=function()
    {
        window.open("index.html#itemShow/"+$scope.programInfo.program_id);
    }



});