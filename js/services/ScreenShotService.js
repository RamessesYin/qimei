/**
 * Created by William on 2016/4/16 
 * Modified by Ramesses on 2016 8/28
 */


app.factory('ScreenShot',['RESTClient','URL',function(RESTClient,URL){
    var self={};
    var element=$('video');
    var video=element.get(0);
    var canvas=document.createElement("canvas"); 
    var vw=-1;
    var vh=-1;


    self.shot=function(x,y,w,h)
    {
        if(vw==-1)
        {
            vw=element.get(0).videoWidth;
            vh=element.get(0).videoHeight;
        }

        //var canvas = document.createElement("canvas");  
        
        canvas.width = element.width()*w ;  
        canvas.height = element.height()*h ;

        canvas.getContext('2d')  
        .drawImage(video, x*vw, y*vh, vw*w, vh*h,0,0,canvas.width,canvas.height); 

        //var img = document.createElement("img");

        return canvas.toDataURL(); 

    }
   
    return self;
}]);


