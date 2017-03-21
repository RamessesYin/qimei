/**
 * Created by Ramesses on 2016/9/3
 */


var app = angular.module(PROJECT);


app.controller('EditCtrl',function($scope,$rootScope,RESTClient,Category,$state,URL,TVPlay,$timeout,$stateParams,CanvasEdit,ScreenShot,Track)
{
    $scope.FILE_URL=URL.FILE;
    $rootScope.curMode=1;
    if($rootScope.help=='skip')
     {
        location.reload();
     }
    var modes=['showing','relate_edit','object_add'];
    $scope.curEditMode=0;
    $scope.modes={
        SHOW:0,
        RELATE_E:1,
        OBJECT_A:2,
        TRACK_A:3,
        TRACK_A_ING:4,
        OBJECT_E:5,
        TRACK_E:6
    }
    

    

    var trackCanvas=$("#trackCanvas");

    $scope.playControl=TVPlay.controller;

    $scope.tracksInfo=Track.tracksInfo;
    $scope.curTracks=Track.curTracks;
    $scope.selectedTrackIdx=null;

    



    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;


    $rootScope.proId=programId;
    $rootScope.epiId=episodeId;
    var programInfo={};

    $scope.types=['衣服','包','裤子','鞋子'];

    $scope.curType=0;
    var relates=[];
    $scope.curRelates=[];
    $scope.selectedRelate=null;

    var objects=[];
    $scope.curObjects=[];
    $scope.selectedObject=null;

    $scope.category=Category.category;

    var backupData={};

    //some vars related to track
    var trackList=[];
    var newTrack=null;

    var lockedTrack=null;

    $scope.newRelate={
        name:'',
        abstract:''
    };
    /*var trackList={
        time_list:[],
        x_list:[],
        y_list:[],
        width_list:[],
        height_list:[]
    }*/


/*
    $scope.addObject=function()
    {
        CanvasEdit.show();
        TVPlay.controller.pause();
        $scope.curEditMode=1;
    }*/
    $scope.selectTrack=function(idx)
    {
        log('select');
        $scope.selectedTrackIdx=idx;
    }

    $scope.changeMode=function(mode)
    {
        TVPlay.controller.pause(0.2,true);

        if(mode==$scope.modes.RELATE_E)
        {
            
            if($scope.selectedTrackIdx==null)
            {
                prompt('请选择跟踪信息！');
                return;
            }
            backupData.curTracks=$scope.curTracks;
            $scope.curTracks=angular.copy(backupData.curTracks);
            $scope.selectedRelate=null;
            
        }
        else if(mode==$scope.modes.TRACK_A)
        {
            $scope.selectedRelate=null;
            CanvasEdit.show();
        }
        //start to add a new track
        else if(mode==$scope.modes.TRACK_A_ING)
        {
            /*sleep(1000);
            var posi=CanvasEdit.getPosi();
            var img=ScreenShot.shot(posi.x,posi.y,posi.w,posi.h);
            sleep(1000);
            //newTrack.img=img.substring(22);

            $("<img/>").attr('src',img).appendTo("#imgCont");*/
            
            $scope.curEditMode=mode;
            createObj();
            
        }
        //modify the object of selected track 
        else if(mode==$scope.modes.OBJECT_E)
        {

            if($scope.selectedTrackIdx==null)
            {
                prompt('请选择跟踪信息！');
                return;
            }
            CanvasEdit.show();
            $scope.selectedObject=null;
        }
        else if(mode==$scope.modes.TRACK_E)
        {
            if($scope.selectedTrackIdx==null)
            {
                prompt('请选择跟踪信息！');
                return;
            }
            trackList=[];
            lockedTrack=angular.copy($scope.curTracks[$scope.selectedTrackIdx]);
            CanvasEdit.show();
        }
        //backupData.curTracks=$scope.curTracks;
        $scope.curEditMode=mode;
    }

    $scope.addTrack=function()
    {
        var posi=CanvasEdit.getPosi();
        console.log(posi);
        posi.time=TVPlay.currentTime();
        trackList.push(posi);
        $scope.playControl.next();
    }

    $scope.saveEditedTrack=function()
    {
        var data=Track.editTrack(lockedTrack,trackList);
        if(data)
        {
            data.time_list=JSON.stringify(data.time_list);
            data.x_list=JSON.stringify(data.x_list);
            data.y_list=JSON.stringify(data.y_list);
            data.width_list=JSON.stringify(data.width_list);
            data.height_list=JSON.stringify(data.height_list);

            RESTClient.updateResource(URL.REQUEST+'track/'+programId+'/'+lockedTrack.object_id,data)
                    .then(function(data){
                        prompt('修改成功');
                        chModeToShow();
                    });
        }
    }

    $scope.saveAddedTrack=function()
    {
        //if()
        if($scope.types[$scope.curType].type!=0 && 
            ($scope.newRelate.name=='' || $scope.newRelate.abstract=='') && 
            $scope.selectedRelate==null)
        {
            $("#newRelateModal").modal("show");
            return ;
        }

        if($scope.selectedRelate==null && $scope.types[$scope.curType].type==0)
        {
            prompt('请选择对应商品');
            return ;
        }
        newTrack.type=$scope.curType;
        newTrack.state=1;
        newTrack.name=$scope.newRelate.name;
        newTrack.abstract=$scope.newRelate.abstract;

        if($scope.types[$scope.curType].type==0 || $scope.selectedRelate!=null)
        {
            newTrack.relate_pic=$scope.selectedRelate.relate_pic;
            newTrack.relate_id=$scope.selectedRelate.relate_id;
        }

        RESTClient.addResource(URL.REQUEST+'objects/'+programId,newTrack)
            .then(function(rtn){
                //console.log(data);
                newTrack.object_id=rtn.object_id;
                newTrack.object_pic=rtn.object_pic;

                if($scope.types[$scope.curType].type!=0 && $scope.selectedRelate==null)
                {
                    newTrack.relate_pic=rtn.relate_pic;
                    newTrack.relate_id=rtn.relate_id;
                }

                initObjects();
                /*else
                {
                    newTrack.relate_pic=$scope.selectedRelate.relate_pic;
                    newTrack.relate_id=$scope.selectedRelate.relate_id;
                }*/


                newTrack.display_type=0;
                var data=Track.addTrack(newTrack,trackList);

                data.time_list=JSON.stringify(data.time_list);
                data.x_list=JSON.stringify(data.x_list);
                data.y_list=JSON.stringify(data.y_list);
                data.width_list=JSON.stringify(data.width_list);
                data.height_list=JSON.stringify(data.height_list);


                RESTClient.updateResource(URL.REQUEST+'track/'+programId+'/'+newTrack.object_id,data)
                    .then(function(data){
                        $('#newRelateModal').modal('hide');
                        if(($scope.types[$scope.curType].type!=0) && $scope.selectedRelate==null)
                        {
                            $scope.changeType($scope.types[$scope.curType].id);
                        }
                        prompt('修改成功');
                        chModeToShow();
                    });
                
            });

        
    }


     $scope.new_saveAddedTrack=function()
    {
        //if()
        if($scope.newRelate.name=='' || $scope.newRelate.abstract=='')
        {
            $("#newRelateModal").modal("show");
            return ;
        }
        newTrack.type=$scope.curType;
        log($scope.curType);
        newTrack.state=1;
        log(newTrack);
        newTrack.name=$scope.newRelate.name;
        newTrack.abstract=$scope.newRelate.abstract;
        RESTClient.addResource(URL.REQUEST+'objects/'+programId,newTrack)
            .then(function(rtn){
                log(rtn);
                newTrack.object_id=rtn.object_id;
                newTrack.object_pic=rtn.object_pic;
                newTrack.relate_pic=rtn.relate_pic;
                newTrack.relate_id=rtn.relate_id;
                initObjects();


                newTrack.display_type=0;
                log(newTrack);
                var data=Track.addTrack(newTrack,trackList);

                data.time_list=JSON.stringify(data.time_list);
                data.x_list=JSON.stringify(data.x_list);
                data.y_list=JSON.stringify(data.y_list);
                data.width_list=JSON.stringify(data.width_list);
                data.height_list=JSON.stringify(data.height_list);

                log(data);
                RESTClient.updateResource(URL.REQUEST+'track/'+programId+'/'+newTrack.object_id,data)
                    .then(function(data){
                        $('#newRelateModal').modal('hide');
                        if(($scope.types[$scope.curType].type!=0) && $scope.selectedRelate==null)
                        {
                            $scope.changeType($scope.types[$scope.curType].id);
                        }
                        prompt('修改成功');
                        chModeToShow();
                    });
                
            });

        
    }




    var createObj=function()
    {
        $timeout(function(){

            var posi=CanvasEdit.getPosi();
            var img=ScreenShot.shot(posi.x,posi.y,posi.w,posi.h);
            log(img);
                newTrack={
                name:'',
                abstract:'',
                state:'',
                type:'',
                object_pic:img,
                video_id:episodeId,
                relate_id:-1,
                remark:programInfo.remark
            }

            $scope.addTrack();
            
        },200);    
    }



    $scope.playControl.next=function()
    {
        TVPlay.controller.nextFrame(0.2,function(time){
            /*$scope.$apply(function(){
                
            });*/
            Track.updateCanvas(time);
            $scope.tracksInfo=Track.tracksInfo;
            $scope.curTracks=Track.curTracks;
            
            //$scope.$apply();
        });
    }
    $scope.playControl.nextSeg=function()
    {
        var time=Track.nextSegFrame(TVPlay.currentTime());
        if(time>0)
            TVPlay.jumpTo(time);
        else
            prompt('已经到达最后一段');
    }
    $scope.playControl.prevSeg=function()
    {
        var time=Track.prevSegFrame(TVPlay.currentTime());
        if(time>0)
            TVPlay.jumpTo(time);
        else 
            prompt('已经到达第一段');
        
    }
    $scope.playControl.prev=function()
    {
        TVPlay.controller.prevFrame(0.2,function(time){
            Track.updateCanvas(time);
            $scope.tracksInfo=Track.tracksInfo;
            $scope.curTracks=Track.curTracks;
            //$scope.$apply();
        });
    }

    $scope.cancelEditMode=function()
    {
        $scope.curTracks=backupData.curTracks;
        chModeToShow();
    }

    $scope.confirm=function()
    {
        if($scope.curEditMode==$scope.modes.RELATE_E)
        {
            if($scope.selectedRelate==null)
            {
                prompt('请选择对应图片！');
                return ;
            }
            if($scope.curTracks[$scope.selectedTrackIdx]==null)
            {
                prompt('所选跟踪信息不能为空！');
                return ;
            }
            var data=angular.copy($scope.curTracks[$scope.selectedTrackIdx]);
            $.extend(data,{
                video_id:episodeId,
                remark:programInfo.remark,
                object_pic_path:data.object_pic
            });
            data.object_pic="";
            data.relate_id=$scope.selectedRelate.relate_id;
            var oj_id=data.object_id;
            delete data.id;
            delete data.object_id;
            delete data.relate_pic;
            RESTClient.updateResource(URL.REQUEST+'object/'+programId+'/'+oj_id,data)
                .then(function(data){
                    backupData.curTracks[$scope.selectedTrackIdx].relate_pic=$scope.selectedRelate.relate_pic;
                    backupData.curTracks[$scope.selectedTrackIdx].relate_id=$scope.selectedRelate.relate_id;
                    $scope.curTracks=backupData.curTracks;
                    chModeToShow();
                },function(res){
                    log(res);
                    prompt('修改失败，请重试');
                });
        }
        else if($scope.curEditMode==$scope.modes.OBJECT_E)
        {
            var data=angular.copy($scope.curTracks[$scope.selectedTrackIdx]);
            if(data==null)
                return ;
            var oj_id=data.object_id;
            var posi=CanvasEdit.getPosi();
            var img=ScreenShot.shot(posi.x,posi.y,posi.w,posi.h);

            $.extend(data,{
                video_id:episodeId,
                remark:programInfo.remark,
                object_pic_path:'',
                object_pic:img,
            });

            log(data);

            if(data.id) delete data.id;
            if(data.object_id) delete data.object_id;
            if(data.relate_pic) delete data.relate_pic;


        

            RESTClient.updateResource(URL.REQUEST+'object/'+programId+'/'+oj_id,data)
                .then(function(data){
                    //log(data)
                    //backupData.curTracks[$scope.selectedTrackIdx].object_pic=$scope.selectedObject.object_pic;
                    $scope.curTracks[$scope.selectedTrackIdx].object_pic=data.object_pic;
                    chModeToShow();
                },function(res){
                    log(res);
                    prompt('修改失败，请重试');
                });

        }
    }


    $scope.delCurFrame=function()
    {
        if($scope.selectedTrackIdx==null)
        {
            prompt('请选择跟踪信息！');
            return;
        }
        if(confirm('您确定要删除该帧的追踪信息吗?'))
        {
            rtn=Track.delCurFrame(TVPlay.currentTime(),$scope.selectedTrackIdx);


            if(rtn.status==2)
            {
                prompt('不存在追踪信息！');
            }
            //删除成功
            else if(rtn.status==1)
            {
                var data=rtn.data;
                data.time_list=JSON.stringify(data.time_list);
                data.x_list=JSON.stringify(data.x_list);
                data.y_list=JSON.stringify(data.y_list);
                data.width_list=JSON.stringify(data.width_list);
                data.height_list=JSON.stringify(data.height_list);
                RESTClient.updateResource(URL.REQUEST+'track/'+programId+'/'+$scope.curTracks[$scope.selectedTrackIdx].object_id,data)
                    .then(function(data){
                        /*if(!$scope.$$phase) {
                            $scope.$apply(function($scope){
                                $scope.curTracks=Track.curTracks;
                            });
                        }*/
                        $scope.playControl.next();
                        
                        prompt('修改成功');
                    });
            }
        }   
    }

    $scope.delSegFrame=function()
    {
        if($scope.selectedTrackIdx==null)
        {
            prompt('请选择跟踪信息！');
            return;
        }
        if(confirm('您确定要删除该帧的追踪信息吗?'))
        {
            rtn=Track.delSegFrame(TVPlay.currentTime(),$scope.selectedTrackIdx);
            if(rtn.status==2)
            {
                prompt('不存在追踪信息！');
            }
            //删除成功
            else if(rtn.status==1)
            {
                var data=rtn.data;
                data.time_list=JSON.stringify(data.time_list);
                data.x_list=JSON.stringify(data.x_list);
                data.y_list=JSON.stringify(data.y_list);
                data.width_list=JSON.stringify(data.width_list);
                data.height_list=JSON.stringify(data.height_list);

                RESTClient.updateResource(URL.REQUEST+'track/'+programId+'/'+$scope.curTracks[$scope.selectedTrackIdx].object_id,data)
                    .then(function(data){
                        $scope.playControl.next();
                        prompt('修改成功');

                    });
            }
        }
    }




    $scope.deleteObj=function()
    {
        if($scope.selectedTrackIdx==null)
        {
            prompt('请选择跟踪信息！');
            return;
        }
        if(confirm('您确定要删除该物品吗？'))
        {
            RESTClient.deleteResource(URL.REQUEST+'object/'+programId+'/'+$scope.curTracks[$scope.selectedTrackIdx].object_id)
                .then(function(data){
                    Track.delTrack($scope.curTracks[$scope.selectedTrackIdx]);
                    prompt('修改成功');
                    Track.updateCanvas(TVPlay.currentTime());
                });
        } 
    }


    $scope.changeType=function(idx)
    {
        $scope.curType=idx;
        $scope.selectedRelate=null;
        initRelates();
    }


    $scope.selectRelate=function(idx)
    {

        if($scope.selectedRelate!=null)
        {
            $("#relate_pic_"+$scope.selectedRelate.relate_id).removeClass('relateSelected');
            if($scope.selectedRelate.relate_id==$scope.curRelates[idx].relate_id)
            {
                $scope.selectedRelate==null
                return ;
            }
        }

        $scope.selectedRelate=$scope.curRelates[idx];

        $("#relate_pic_"+$scope.selectedRelate.relate_id).addClass('relateSelected');

        //in the mode of editing the relate
        if($scope.curEditMode==$scope.modes.RELATE_E)
        {
            if($scope.selectedTrackIdx!=null && $scope.curTracks[$scope.selectedTrackIdx]!=null)
            {
                $scope.curTracks[$scope.selectedTrackIdx].relate_pic=$scope.curRelates[idx].relate_pic;
            }
        }
    }

    $scope.selectObject=function(idx)
    {
        if($scope.selectedObject!=null)
        {
            $("#object_pic_"+$scope.selectedObject.object_id).removeClass('relateSelected');
        }
        $scope.selectedObject=$scope.curObjects[idx];
        $("#object_pic_"+$scope.selectedObject.object_id).addClass('relateSelected');

        //in the mode of editing the relate
        if($scope.curEditMode==$scope.modes.OBJECT_E)
        {
            if($scope.selectedTrackIdx!=null && $scope.curTracks[$scope.selectedTrackIdx]!=null)
            {
                $scope.curTracks[$scope.selectedTrackIdx].object_pic=$scope.curObjects[idx].object_pic;
            }
        }
    }


    

    //get program info by id
    RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){

            programInfo=data.programinfo;

            var v_idx=-1;
            for(var i=0;i<programInfo.video_id.length;i++)
            {
                if(programInfo.video_id[i]==episodeId)
                {
                    v_idx=i;
                    break;
                }
            }
            if(v_idx==-1)
            {
                prompt('文件不存在!');
                return ;
            }
                

            TVPlay.init(programInfo.video_name[v_idx],function(size){

                var v_container=$('video').closest('div');

                //prepare the element for ScreenShot Service
                var box=$("<div/>").css({width:'50px',height:'50px',border:'solid',position:'absolute'});
                var handle=$("<div/>").css({width: '10px',
                    height: '10px',
                    overflow: 'hidden',
                    cursor: 'se-resize',
                    position: 'absolute',
                    right:   '0',
                    bottom: '0',
                    'background-color': '#09C'});
                box.append(handle);
                v_container.append(box);

                //init CanvasEdit Service
                CanvasEdit.init(v_container,box,handle);
                CanvasEdit.hide();

                //init TrackService
                Track.init('edit',{
                    programId:programId,
                    episodeId:episodeId,
                    container:v_container},function(){

                        $scope.tracksInfo=Track.tracksInfo;
                        $scope.curTracks=Track.curTracks;
                        //$scope.$apply();
                        //console.log($scope.tracksInfo);
                        /*$scope.$apply(function(){
                            $scope.tracksInfo=Track.tracksInfo;
                            $scope.curTracks=Track.curTracks;
                        })*/

                    });

                Track.setRatio(size.w,size.h);

                TVPlay.videoUpdate(function(time)
                {
                    
                    $scope.$apply(function(){
                        Track.updateCanvas(time);
                    });

                },true); 
            });
        });

    RESTClient.getResource(URL.REQUEST+'types')
        .then(function(data){
            if(data)
            {
                $scope.types=data.types;
                initRelates();
            }
        });


    $('#newRelateModal').on('hidden.bs.modal', function () {
        $scope.newRelate.name='';
        $scope.newRelate.abstract='';
    });



    var chModeToShow=function()
    {
        CanvasEdit.hide();
        $scope.curEditMode=0;
    }

    var initObjects=function()
    {
        RESTClient.getResource(URL.REQUEST+"objects/"+programId,{video_id:episodeId})
            .then(function (data){

                objects=[];
                $scope.curObjects=[];

                var M=3,N=6;
    
                var r=data.objects;

                if(r==null) return ;

                var i=0;
                for(;i<r.length;i+=M*N)
                {
                    var tmp=new Array();
                    for(var j=0;j<M*N && i+j<r.length;j++)
                    {
                        tmp.push(r[i+j]);
                    }
                    objects.push(tmp);
                }

                /*$scope.curRelates=relates[0];*/

                initPaginator($('#obj_jqPaginator'),objects.length,function(num,type){
                    try{

                        $scope.curObjects=objects[num-1];

                        if(!$scope.$$phase) {
                            $scope.$apply(function($scope){
                                $scope.curObjects=objects[num-1];
                            });
                        }

                    }
                    catch(e)
                    {
                        //log(e);
                    }
                });
            });
    }

    var initRelates=function()
    {
        //init the gallery
        RESTClient.getResource(URL.REQUEST+"relates/"+programId,{type:$scope.types[$scope.curType].id})
            .then(function (data){
                relates=[];
                $scope.curRelates=[];
                
                var M=3,N=6;
    
                var r=data.relates;
                var i=0;
                for(;i<r.length;i+=M*N)
                {
                    var tmp=new Array();
                    for(var j=0;j<M*N && i+j<r.length;j++)
                    {
                        tmp.push(r[i+j]);
                    }
                    relates.push(tmp);
                }

                /*$scope.curRelates=relates[0];*/

                initPaginator($('#rel_jqPaginator'),relates.length,function(num,type){
                    try{
                        $scope.curRelates=relates[num-1];
                        if(!$scope.$$phase) {
                            $scope.$apply(function($scope){
                                $scope.curRelates=relates[num-1];
                            });
                        }

                         
                    }
                    catch(e)
                    {
                        //log(e);
                    }
                });
            });

    }


    var initPaginator=function(ele,total,callback)
    {
        if(total>0)
        {
            try{
                ele.jqPaginator({
                    totalPages: total,
                    visiblePages: 5,
                    currentPage: 1,
                    first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
                    prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
                    next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
                    last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
                    page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>',
                    onPageChange: function (num, type) {
                        callback(num,type);
                    }
                });
            }
            catch(e){}
            //log('total='+total);
            
        }
        else
        {
            try{
               $('#rel_jqPaginator').jqPaginator('destroy'); 
            }
            catch(e)
            {
                //log(e);
            }
            
        }          
    }

    $scope.toObjManagerPage=function()
    {
        window.open("index.html#object/"+programId+'/'+episodeId);
    }

    $scope.toRelManagerPage=function()
    {
        window.open("index.html#item/"+programId+'/'+episodeId);
    }

    
    initObjects();
    // if($rootScope.help==0)
    // {
    //     log("开始重载");
    //     $rootScope.help=1;
    //     log($rootScope.help);
    //     // location.reload();

    // }
    



});