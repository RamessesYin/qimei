/**
 * Created by William on 2016/4/16
 * Modified by Ramesses on 2016 9/3
 */


app.factory('CanvasEdit',['RESTClient','URL',function(RESTClient,URL){

    var self={};

    var canvas="#editCanvas";
    var box="#choiseBox";
    var video=$("video");

    /*
    @param c  canvas
    @param b  box
    @param h  handle of the box
    */
    var init=function(c,b,h)
    {
        $(document).mousemove(function(e) {
            if (!!this.move) {
                var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
                    callback = document.call_down || function() {
                        log("e.pageY:"+e.pageY+"\n posix.y:"+posix.y+"\n e.pageX:"+e.pageX+"\n posix.x:"+posix.x);
                        $(this.move_target).css({
                            'top': e.pageY - posix.y,
                            'left': e.pageX - posix.x
                        });
                    };
                callback.call(this, e, posix);
            }})
            .mouseup(function(e) {
                if (!!this.move) {
                    var callback = document.call_up || function(){};
                    callback.call(this, e);
                    $.extend(this, {
                        'move': false,
                        'move_target': null,
                        'call_down': false,
                        'call_up': false
                    });
                }
        });

        var $box = $(h).on('mousedown',  function(e) {
            var posix = {
                    'w': $(b).width(), 
                    'h': $(b).height(), 
                    'x': e.pageX, 
                    'y': e.pageY
                };
             
            $.extend(document, {'move': true, 'call_down': function(e) {
                //log(c)
                $(b).css({
                    'width': Math.min(Math.max(30, e.pageX - posix.x + posix.w),
                                    $(c).offset().left+$(c).width()-$(b).offset().left),
                    'height': Math.min(Math.max(30, e.pageY - posix.y + posix.h),
                                    $(c).offset().top+$(c).height()-$(b).offset().top
                        )
                });
            }});
            return false;
        });
        
    }


    self.show=function()
    {
        //$(canvas).css('display','');
        $(box).css({
            left:'0px',
            top:'0px',
            width:'100px',
            height:'100px',
            display:''
        });
    }

    self.hide=function()
    {
        $(box).css('display','none');
    }

    self.getPosi=function()
    {
        var width=$(canvas).width();
        var height=$(canvas).height();
        return {
            x:parseFloat((($(box).offset().left-$(canvas).offset().left)/width).toFixed(3)),
            y:parseFloat((($(box).offset().top-$(canvas).offset().top)/height).toFixed(3)),
            w:parseFloat((($(box).width())/width).toFixed(3)),
            h:parseFloat((($(box).height())/height).toFixed(3))
        };
    }


    self.init=function(c,b,h)
    {
        canvas=c;
        box=b;
        //init(canvas,"#choiseBox","#handle");
        init(c,b,h)
        $(b).Tdrag({
            scope:'#'+c.attr('id')
        });
    }
   
    return self;
}]);


