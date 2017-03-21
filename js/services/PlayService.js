/**
 * Created by William on 2016/4/16 0016.
 * Modified by Ramesses on 2016 9/3
 */



app.factory('TVPlay',['RESTClient','URL',function(RESTClient,URL){

    var self={};
    var video=$('video').get(0);
    var player=null;


    //记录在视频进度更新时需要执行的函数
    var videoUpdateFun=[];
    var videoUpdateHighTimeFun=[];

    var lastUpdateTime=0;

    //some functions to control the video
    self.controller={}


    

    self.init=function (file,callBack)
    {
        player=videojs(video,{
            autoplay:false
        },function(){

            this.on('loadeddata',function(){
                var w=$(video).closest('.col-xs-12').width();
                var h=video.videoHeight/video.videoWidth*$(video).closest('.col-xs-12').width();
                //$("#editCanvas").css({width:w,height:h});
                player.dimensions(w,h);

                callBack({w:w,h:h});

            });


            var over=function()
            {
                var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                if(fullscreenElement==null)
                {
                    $('body').find('#slider-row').css({'top':'-140px'});
                }
                else
                {
                    $('body').find('#slider-row').css({'top':'0px'});
                    $('body').find('.slidimg-container').css({'bottom':'30px'});
                }
            }

            var leave=function()
            {
                var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                if(fullscreenElement==null)
                {
                    $('body').find('#slider-row').css({'top':'-110px'});
                }
                else
                {
                    $('body').find('#slider-row').css({'top':'0px'});
                    $('body').find('.slidimg-container').css({'bottom':'0px'});
                }
            }

            var sliderCont= ($('body').find('.slidimg-container').closest('div'));

            sliderCont.mouseover(function(){
                over()
            });
            sliderCont.mouseleave(function(){
                leave()
            });

            var controlBar=$('body').find('.vjs-control-bar');
            controlBar.mouseover(function(){
                over()
            });
            controlBar.mouseleave(function(){
                leave()
            });



            var hideSliderBtn=$('body').find('.vjs-subtitles-button');
            hideSliderBtn.removeClass('vjs-hidden');
            hideSliderBtn.removeClass('vjs-subtitles-button');
            hideSliderBtn.html('<span class="glyphicon glyphicon-adjust" style="top:10px"></span>');
            hideSliderBtn.on('click',function(){
                var sc=$('body').find('.slidimg-container');
                if(sc.hasClass('hidden'))
                {
                    sc.removeClass('hidden');
                }
                else sc.addClass('hidden');
            });

            //$('body').off('click','.vjs-fullscreen-control');
            var alternative= $('body').find('.vjs-audio-button');
            alternative.removeClass('vjs-hidden');
            alternative.html('<span class="glyphicon glyphicon-fullscreen" style="top:10px"></span>');
            alternative.on('click',function(){
                element=document.getElementById('full');
                var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                if(fullscreenElement!=null)
                {
                    if(document.exitFullscreen) {
                      document.exitFullscreen();
                    } else if(document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                    } else if(document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                    }
                }
                else
                {
                    if(element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if(element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if(element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if(element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                }

                
            })
            $('body').find('.vjs-fullscreen-control').css('display','none');
            /*$('body').find('.vjs-fullscreen-control').on('click',function(){
                alert(1);
            }); */      
        });

        

        player.src(URL.FILE+file);
        
 
    //player.src('http://vjs.zencdn.net/v/oceans.mp4');
        

        //callback when the player is playing
        player.on('timeupdate',(function(){

            var curTime=player.currentTime();
            for (var i = 0; i < videoUpdateHighTimeFun.length; i++)
            {
                videoUpdateHighTimeFun[i](curTime);
            }
            if(parseInt(curTime)==lastUpdateTime)
            {
                return ;
            }

            lastUpdateTime=parseInt(curTime);

            var len=videoUpdateFun.length;
            for (var i=0;i<len;i++)
            {
                videoUpdateFun[i](curTime);
            }
        }));

    };

    //播放/暂停
    self.controller.playOrPause=function ()
    {
        player.paused()?player.play():player.pause();
    };

    //pause
    self.controller.pause=function(interval,callback)
    {
        if(interval)
        {
            var curTime=Math.round(player.currentTime()*10);
            player.currentTime(Math.round(curTime/(interval*10))*interval);
        }
        player.pause();
    }

    self.controller.nextFrame=function(interval,callback)
    {
        self.controller.pause();
        //log('nextFrame');
        var curTime=Math.round(player.currentTime()*10);
        var time=Math.round(curTime/(interval*10))*interval+interval;
        time=(time<player.duration())?time:player.duration();
        player.currentTime(time);

        if(callback)
            callback(time);
    }

    self.controller.prevFrame=function(interval,callback)
    {
        self.controller.pause();

        var curTime=Math.round(player.currentTime()*10);
        var time=Math.round(curTime/(interval*10))*interval-interval;
        time=time>=0?time:0;

        player.currentTime(time);
        if(callback)
            callback(time);
    }

    self.currentTime=function()
    {
        return player.currentTime();
    }



    //跳转到对应时间
    self.jumpTo=function(time)
    {
        if (time > player.duration())
        {
            return;
        }
        player.currentTime(time);
    }


    /*
    @param fun          the function called every time when  the video updates
    @param argument[1]  the function called per second when  the video updates 
    */
    self.videoUpdate=function (fun)
    {
        if(arguments[1])
        {
            var len=videoUpdateHighTimeFun.length;
            var isExist=false;
            for (var i=0;i<len;i++)
            {
                if(videoUpdateHighTimeFun[i]==fun)
                {
                    isExist=true;
                    break ;
                }
            }
            if(!isExist)
            {
                videoUpdateHighTimeFun.push(fun);
            }
        }
        else 
        {
            var len=videoUpdateFun.length;
            var isExist=false;
            for (var i=0;i<len;i++)
            {
                if(videoUpdateFun[i]==fun)
                {
                    isExist=true;
                    break ;
                }
            }
            if(!isExist)
            {
                videoUpdateFun.push(fun);
            }
        }
        console.log("time???");
        log(fun);
    };

    return self;
}]);


