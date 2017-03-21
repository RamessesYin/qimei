/**
 * Modified by Ramesses on 2016/9/3
 */


var app = angular.module(PROJECT);




app.controller('ShowCtrl',function($scope,$rootScope,RESTClient,$state,URL,TVPlay,$stateParams,Track,Slider,FullScreen)
{
    $scope.FILE_URL=URL.FILE;
    $rootScope.curMode=0;
     if($rootScope.help=='skip')
     {
        location.reload();
     }
    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;
    
    $rootScope.proId=programId;
    $rootScope.epiId=episodeId;
    var programInfo={};
    var lastRelateId=null;

    $scope.next=Slider.nextTag;
    $scope.prev=Slider.prevTag;

    $scope.relateScreen=function(url)
    {
        window.open(url);
    }

    FullScreen.addEnter(function(){
        var ct=$('body').find('video').closest('div');

        ct.attr('originH',ct.height());

        ct.css({
            height:window.screen.height 
        });
        console.log($('body').find('.slidimg-container').closest('.row').attr('style'));

        var sliderCont=$('body').find('.slidimg-container')
        sliderCont.closest('.row').css('width','100%');
        sliderCont.css({
            'position': 'absolute',
            'bottom'  : '10px'
        });
        $('.slider').css('width',$('video').closest('.col-xs-12').width()-110);
        $('body').find('#slider_row').css('top','0px');
    });

    FullScreen.addExit(function(){

        var ct=$('body').find('video').closest('div');
        ct.css('height',ct.attr('originH')+'px');

        var sliderCont=$('body').find('.slidimg-container')
        sliderCont.closest('.row').css('width','');
        sliderCont.css({
            'position': '',
            'bottom'  : null
        });
        $('.slider').css('width',$('video').closest('.col-xs-12').width()-110);

        $('body').find('.slidimg-container').closest('.row').css('width','');
        $('body').find('#slider_row').css('top','-110px');
    });

    /*$scope.fullScreen=function()
    {
        element=document.getElementById('full');
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }*/


    //Track.init(programId,episodeId);
    

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

                log(size);

                $('.slider').css({
                    width:size.w-110
                });

                //init TrackService
                Track.init('show',{
                    programId:programId,
                    episodeId:episodeId,
                    container:v_container},
                    function(){
                        Slider.init(Track.relates,$('.imgList'));
                    });
                Track.setRatio(size.w,size.h);

                TVPlay.videoUpdate(Track.updateCanvas,true);


                TVPlay.videoUpdate(function(time){
                    //Track.updateCanvas(time);
                    track=Track.findClosestTrack(time);
                    if(track!=null)
                    {
                        Slider.moveTagById(track.relate_id);
                    }
                    /*if(Track.curTracks[0]!=null && Track.curTracks[0].relate_id!=lastRelateId)
                    {
                        lastRelateId=Track.curTracks[0].relate_id
                        Slider.moveTagById(lastRelateId);
                    }*/
                });        
            });
        });






});