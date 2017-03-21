/**
 * Created by William on 2016/8/2 0018.
 */

var app=angular.module(PROJECT);


app.factory('Slider',function($http, URL){
    var self={};
    var container=null;
    var container_p=null;
    var tagList=[];
    var curNum=-1;

    var v_container=$('video').closest('div');

    self.init=function(data,cont)
    {

        //v_container.append('<div class="row"><div class="slidimg-container" style="width:100%"><div href="#" class="slider-btn next" data-direction="next" style=""><img class="btnleft" src="img/prenxt.png" id="left" ng-click="next()"></div><div class="slider"><ul class="imgList" id="showImg"></ul>/div><div href="#" class="slider-btn prev" data-direction="prev" style=""><img class="btnright" src="img/prenxt.png" id="right" ng-click="prev()"></div></div></div>');

        tagList=data;
        container=cont;
        container_p=container.closest('.slider');
        var len=data.length;
        for(var i=0;i<len;i++) 
        {
            var imgli = $("<li/>").addClass("img-li");
            var url='';
            var data_url='';

            if(data[i].display==1)
            {
                url='show.html?url='+URL.FILE+data[i].relate_screen;
            }
            else if(data[i].display==0)
            {
                url=data[i].relate_url;
            }

            var img=$("<img>").attr({
                "src": URL.FILE+data[i].relate_pic,
                "id": "imgid" + (i),
                "data-url":url,
                "class": "imgsrc",
                'display':'none'
            }).css({
                width: "85px",
                height: "100px",
                margin: "5px 0px",
                "float": "left",
                cursor: "pointer",
                opacity: 0,
                border: "none",
                'padding-left':'0px'
            }).appendTo(imgli);

            img.on('click',function(){
                window.open($(this).attr('data-url'));
            });

            

            imgli.appendTo(container);
        }
        $(".imgsrc").css({
            opacity:0.6,
            border:"none",
        });
        $(".imgsrc").hover(function() {
            $(this).css({
                opacity:1,
                border:"solid 2px #3cc",
            });
        }, function() {
            $(this).css({
                opacity:0.6,
                border:"none",
            });
        });
        self.move(-1);
    }

    /*
    @param num       the num-th tag need to move
    @param boolean   highlight or not
    */
    self.move=function(num)
    {
        if(num>=-1 && num<tagList.length)
        {
            var len=parseInt(container_p.width());

            container.css('transform','translateX('+(0-85*(num-parseInt(len/85)+2))+'px)');

            //container.css('transform','translateY('+(0-70*(num-parseInt(len/70)+2))+'px)');

            if(arguments[1]==true)
            {
                var nowpic="imgid"+num;
                self.hightLightTag(num);
            }
            curNum=num;
        }
    }

    self.nextTag=function()
    {
        self.move(curNum+1);
    }

    self.prevTag=function()
    {
        self.move(curNum-1);
    }

    self.hightLightTag=function(num)
    {
        $(".imgsrc").css({
            opacity:0.6,
            border:"none",
        }).removeClass('selected');

        $(".imgsrc").hover(function() {
            $(this).css({
                opacity:1,
                border:"solid 2px #3cc",
            });
        }, function() {
            $(this).css({
                opacity:0.6,
                border:"none",
            });
        });

        var nowpic="imgid"+num;

        $("#"+nowpic).css({
            opacity:1,
            border:"solid 2px #3cc",
        }).hover(function() {
                $(this).css({
                    opacity:1,
                    border:"solid 2px #3cc",
                });
            }
        ).addClass('selected');
    }

    self.moveTagById=function(relate_id)
    {
        for(var i=0;i<tagList.length;i++)
        {
            if(tagList[i].relate_id==relate_id)
                self.move(i,true);
        }
    }


    return self;
});
