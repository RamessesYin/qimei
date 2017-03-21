/**
 * Created by Ramesses on 2016/9/3
 */


app.factory('Track',['RESTClient','URL',function(RESTClient,URL){
    var self={};
    //var container=null;
    var objects=[];
    var timeList=[];
    var xList=[];
    var yList=[];
    var wList=[];
    var hList=[];
    var styleLists=[];
    var wr=0;
    var hr=0;
    var displayTypes=[];
    var tracks=[];            //the track element
    var displayEles=[];
    var segTime=[];
    var mode='edit';

    self.maxOverlap=0;
    self.curTracks;
    self.tracksInfo=[];

    self.relates=[];

    self.isShowTrack=true;

    /*
    @param type edit or show
    */
    self.init=function(type,para,callback)
    {
        mode=type;
        var programId=para.programId;
        var episodeId=para.episodeId;
        var ct=para.container;
        var url=URL.REQUEST;
        if(type=='edit')
        {
            url+='objects/'+programId;
        }
        else if(type=='show')
        {
            url+='tracks/'+programId;
        }
        //container=ct;
    	try{            
    		RESTClient.getResource(url,{video_id:episodeId})
    			.then(function(data){
                    if(data.objects!=null)
                    {
                        data.tracks=data.objects;
                        delete data.objects;
                    }
                    

                    if(data.tracks==null)
                        return ;
                    data.tracks.sort(function(obj1,obj2){
                        var a=(obj1.time_list[0] instanceof Array)?obj1.time_list[0][0]:obj1.time_list[0];
                        var b=(obj2.time_list[0] instanceof Array)?obj2.time_list[0][0]:obj2.time_list[0];
                        return a-b;
                    });

                    for(var k=0;k<data.tracks.length;k++)
                    {
                        if(data.tracks[k].time_list.length==0)
                            continue;
                        if(!(data.tracks[k].time_list[0] instanceof Array))
                            continue;
                            
                        timeList.push(data.tracks[k].time_list);
                        xList   .push((data.tracks[k].x_list));
                        yList   .push((data.tracks[k].y_list));
                        wList   .push((data.tracks[k].width_list));
                        hList   .push((data.tracks[k].height_list));
                        displayTypes.push(data.tracks[k].display_type);
                        objects.push({
                            name      :data.tracks[k].name,
                            abstract  :data.tracks[k].abstract,
                            state     :data.tracks[k].state,
                            type      :data.tracks[k].type,
                            relate_id :data.tracks[k].relate_id,
                            id        :data.tracks[k].object_id,
                            object_id :data.tracks[k].object_id,
                            object_pic:data.tracks[k].object_pic?data.tracks[k].object_pic:'/file/404.jpg',
                            relate_pic:data.tracks[k].relate_pic?data.tracks[k].relate_pic:'/file/404.jpg',
                        });
                        for(var l=0;l<data.tracks[k].time_list.length;l++)
                        {
                            segTime.push(data.tracks[k].time_list[l][0]);
                        }
                        if(type=='show')
                        {
                            var isExist=false;
                            for(var m=0;m<self.relates.length;m++)
                            {
                                if(self.relates[m].relate_id==data.tracks[k].relate_id)
                                {
                                    isExist=true;
                                    break;
                                }
                            }
                            if(!isExist)
                            {
                                self.relates.push({
                                    display:data.tracks[k].display,
                                    relate_id:data.tracks[k].relate_id,
                                    relate_pic:data.tracks[k].relate_pic,
                                    relate_screen:data.tracks[k].relate_screen,
                                    relate_url:data.tracks[k].relate_url
                                });
                            }
                                
                        }
                    }

                    segTime.sort(function(a,b){
                        return a-b;
                    });

                    self.maxOverlap=getMaxOverlap(timeList);
                    self.curTracks=new Array(self.maxOverlap);
                    log("TrackService curTracks");
                    log(self.curTracks);
                    

    				for(var i=0;i<self.maxOverlap;i++)
    				{

                        if(mode=='edit')
                        {
                            var color=getRandomColor();
                            var display=$("<div/>").css({
                                border:'solid 1px '+color,
                                display:'none',
                                position:'absolute'
                            });
                            ct.append(display);
    
                            self.tracksInfo.push({
                                color:color
                            });
                            displayEles.push(display);
                            tracks.push(display);
                        }
                        else if(mode=='show')
                        {
                            var color=getRandomColor();
                            var display=$("<img/>").css({
                                'display':'none',
                                'height':'25px',
                                'z-index':999,
                                'position':'absolute'
                            });
                            display.attr('src',URL.FILE+'/file/point.gif');
                            /*display.css({
                                width:'50px',
                                height:'50px'
                            });*/
                            ct.append(display);
    
                            self.tracksInfo.push({
                                color:color
                            });
                            displayEles.push(display);
                            tracks.push(display);
                        }
                        
    				}
                    if(callback) callback();
    			});
    	}
    	catch(e)
    	{
    		log(e);
    	}
    }

    self.findClosestTrack=function(time)
    {
        var len=timeList.length;
        var num=0;
        var i=0,j=0,k=0;
        var rtn=[];
        var idx=-1;
        var diff=9999999;

        for(i=0;i<len;i++)
        {
            for(j=0;j<timeList[i].length;j++)
            {
                for(k=0;k<timeList[i][j].length;k++)
                {
                    var d=Math.abs(timeList[i][j][k]-time)
                    if(d<diff)
                    {
                        diff=d;
                        idx=i;
                    }
                }
            }
        }
        if(idx>=0)
            return objects[idx];
        else
        {
            if(objects.length>0)
                return objects[0];
            else return null;
        }
    }

    self.delCurFrame=function(time,idx)
    {
        var rtn=findIdxByTime(time);
        if(rtn.length==0)
        {
            return {status:2};
        }
        for(var i=0;i<rtn.length;i++)
        {
            var curIdx=rtn[i];
            if(curIdx[3]==idx)
            {
                //删除的为某一段的第一帧
                if(curIdx[2]==0)
                {
                    var seg_idx=segTime.indexOf(timeList[curIdx[0]][curIdx[1]][0]);
                    if(seg_idx>=0)
                        segTime.splice(seg_idx,1);
                }
                timeList[curIdx[0]][curIdx[1]].splice(curIdx[2],1);
                xList[curIdx[0]][curIdx[1]].splice(curIdx[2],1);
                yList[curIdx[0]][curIdx[1]].splice(curIdx[2],1);
                wList[curIdx[0]][curIdx[1]].splice(curIdx[2],1);
                hList[curIdx[0]][curIdx[1]].splice(curIdx[2],1);
                
                return {
                    status:1,
                    data:{
                        time_list:timeList[curIdx[0]],
                        x_list   :xList[curIdx[0]],
                        y_list   :xList[curIdx[0]],
                        width_list:wList[curIdx[0]],
                        height_list:hList[curIdx[0]],
                        display_type:displayTypes[curIdx[0]]
                    }
                }
            }
        }
        return {status:2};

    }

    self.delSegFrame=function(time,idx)
    {
        var rtn=findIdxByTime(time);
        if(rtn.length==0)
        {
            return {status:2};
        }
        for(var i=0;i<rtn.length;i++)
        {
            var curIdx=rtn[i];
            if(curIdx[3]==idx)
            {
                var seg_idx=segTime.indexOf(timeList[curIdx[0]][curIdx[1]][0]);
                if(seg_idx>=0)
                {
                    segTime.splice(seg_idx,1);
                }

                timeList[curIdx[0]].splice(curIdx[1],1);
                xList[curIdx[0]].splice(curIdx[1],1);
                yList[curIdx[0]].splice(curIdx[1],1);
                wList[curIdx[0]].splice(curIdx[1],1);
                hList[curIdx[0]].splice(curIdx[1],1);
                if(curIdx[2]==0)
                {
                    var seg_idx=segTime.indexOf(curIdx[2]);
                    if(seg_idx>=0)
                        segTime.splice(seg_idx,1);
                }
                return {
                    status:1,
                    data:{
                        time_list:timeList[curIdx[0]],
                        x_list   :xList[curIdx[0]],
                        y_list   :xList[curIdx[0]],
                        width_list:wList[curIdx[0]],
                        height_list:hList[curIdx[0]],
                        display_type:displayTypes[curIdx[0]]
                    }
                }
            }
        }
        return {status:2};

    }

    self.nextSegFrame=function(time)
    {
        if(segTime.length==0)
            return 0;
        else if(time<segTime[0])
            return segTime[0];

        for(var i=0;i<segTime.length-1;i++)
        {
            if(segTime[i]<=time && segTime[i+1]>time)
                return segTime[i+1];
        }
        return 0;
    }
    self.prevSegFrame=function(time)
    {
        if(segTime.length==0)
            return 0;
        else if(time>segTime[segTime.length-1])
            return segTime[segTime.length-1];

        for(var i=0;i<segTime.length-1;i++)
        {
            if(segTime[i]<time && segTime[i+1]>=time)
                return segTime[i];
        }
        return 0;
    }

    self.editTrack=function(obj,data)
    {
        if(data.length==0)
            return null;

        var idxs=findIdxByTime(data[0].time);
        for(var i=0;i<idxs.length;i++)
        {
            var rtn=idxs[i];

            if(obj.object_id==objects[rtn[0]].object_id)
            {
                var result={
                    time_list   :timeList[rtn[0]],
                    x_list      :xList[rtn[0]],
                    y_list      :yList[rtn[0]],
                    width_list  :wList[rtn[0]],
                    height_list :hList[rtn[0]],
                    display_type:displayTypes[rtn[0]]
                }
                var tl=angular.copy(timeList[rtn[0]][rtn[1]]);
                var xl=angular.copy(xList[rtn[0]][rtn[1]]);
                var yl=angular.copy(yList[rtn[0]][rtn[1]]);
                var wl=angular.copy(wList[rtn[0]][rtn[1]]);
                var hl=angular.copy(hList[rtn[0]][rtn[1]]);
                for(var j=rtn[2];j<tl.length && (j-rtn[2])<data.length ;j++)
                {
                    tl[j]=data[j-rtn[2]].time;
                    xl[j]=data[j-rtn[2]].x;
                    yl[j]=data[j-rtn[2]].y;
                    wl[j]=data[j-rtn[2]].w;
                    hl[j]=data[j-rtn[2]].h;
                }
                for(var j=tl.length-rtn[2];j<data.length;j++)
                {
                    tl.push(data[j].time);
                    xl.push(data[j].x);
                    yl.push(data[j].y);
                    wl.push(data[j].w);
                    hl.push(data[j].h);
                }
                result.time_list[rtn[1]]=tl;
                result.x_list     [rtn[1]]=xl;
                result.y_list     [rtn[1]]=yl;
                result.width_list [rtn[1]]=wl;
                result.height_list[rtn[1]]=hl;
                return result;
            }
        }
        return null;

    }


    self.addTrack=function(obj,data)
    {
        if(data.length==0)
            return null;
        var idx=-1;
        if(timeList.length==0)idx=0;
        else if(data[0].time<timeList[0][0][0])idx=0;
        else if(data[0].time > timeList[timeList.length-1][0][0])
        {
            idx=timeList.length-1;
        }
        else{
            for(var i=0;i<objects.length-1;i++)
            {
                if(timeList[i][0][0]<=data[0].time && timeList[i+1][0][0]>data[0].time)
                {
                    idx=i+1;
                    break;
                }
            }
        }
        
        if(idx==-1) idx=0;

        var tl=[[]];
        var xl=[[]];
        var yl=[[]];
        var wl=[[]];
        var hl=[[]];
        for(var i=0;i<data.length;i++)
        {
            tl[0].push(data[i].time);
            xl[0].push(data[i].x);
            yl[0].push(data[i].y);
            wl[0].push(data[i].w);
            hl[0].push(data[i].h);
        }
        objects.splice(idx,0,obj);
        timeList. splice(idx,0,tl);
        xList.    splice(idx,0,xl);
        yList.    splice(idx,0,yl);
        wList.    splice(idx,0,wl);
        hList.    splice(idx,0,hl);
        
        segTime.push(tl[0][0]);

        segTime.sort(function(a,b){
            return a-b;
        });
        return {
            time_list   :tl,
            x_list      :xl,
            y_list      :yl,
            width_list  :wl,
            height_list :hl,
            display_type:obj.display_type
        }
    }


    self.delTrack=function(obj)
    {
        for(var i=0;i<objects.length;i++)
        {
            if(obj.object_id==objects[i].object_id)
            {
                var idx=segTime.indexOf(timeList[i][0][0]);
                if(idx>=0)
                {
                    segTime.splice(idx,1);
                }

                for(var j=0;j<self.curTracks.length && self.curTracks[j]!=null;j++)
                {
                    if(self.curTracks[j].object_id==obj.object_id)
                    {
                        self.curTracks[j]=null;
                        break ;
                    }
                }
                objects.  splice(i,1);
                timeList. splice(i,1);
                xList.    splice(i,1);
                yList.    splice(i,1);
                wList.    splice(i,1);
                hList.    splice(i,1);
                return;
            }
        }
    }

    self.setRatio=function(w_ratio,h_ratio)
    {
    	wr=w_ratio;
    	hr=h_ratio;
    }

    self.setShowStatus=function(isShow)
    {
        self.isShowTrack=isShow;
    }

    self.updateCanvas=function(time)
    {
        if(!self.isShowTrack)
            return ;
        //time=time+0.3;

        destoryTracks();

    	var len=timeList.length;
        var num=0;
        var i=0,j=0,k=0;
        var tmp_objs=[];
    	for(i=0;i<len;i++)
    	{
            obTimeList=timeList[i];

            if(obTimeList[0]>time)
                break;

    		if(obTimeList[obTimeList.length-1] < time)
    			continue;

    		for(j=0;j<obTimeList.length;j++)
    		{
                var segObTimeList=obTimeList[j]; 
                if(segObTimeList[0]>time || segObTimeList[segObTimeList.length-1]<time)
                    continue;
                else
                {
                    for(k=0;k<segObTimeList.length-1;k++)
                    {
                        if(segObTimeList[k]<=time && segObTimeList[k+1] >time)
                        {
                            drawTrack(i,j,k,num);
                            tmp_objs.push(objects[i]);
                            //log(self.curTracks);
                            num++;
                            break;
                        }
                    }
                    break;
                }
    		}
    	}
        for(var i=0;i<self.maxOverlap;i++)
        {
            if(i<num)
            {
                if(self.curTracks[i]==null)
                    self.curTracks[i]=tmp_objs[i];
                else if(tmp_objs[i].object_id!=self.curTracks[i].object_id)
                    self.curTracks[i]=tmp_objs[i]; 
            }
            else
            {
                self.curTracks[i]=null;
            }
            
        }



    }

    /*
    @param idx1 the first index
    @param idx2 the second index
    @param idx3 the third index
    @param num 	the num-th track which appear at the same time
    */
    var drawTrack=function(idx1,idx2,idx3,num)
    {
        try{
            var track=tracks[num];
            var ww=wList[idx1][idx2][idx3]*wr;
            var hh=hList[idx1][idx2][idx3]*hr;
            if(mode=='edit')
            {
                if(wList[idx1][idx2][idx3]+xList[idx1][idx2][idx3]>1)
                {
                    ww=(1-xList[idx1][idx2][idx3])*wr;
                }
                if(hList[idx1][idx2][idx3]+yList[idx1][idx2][idx3]>1)
                {
                    hh=(1-yList[idx1][idx2][idx3])*hr;
                }
                track.css({
                    width: ww,
                    height:hh,
                    left:  xList[idx1][idx2][idx3]*wr,
                    top:   yList[idx1][idx2][idx3]*hr,
                });
            }
            else if(mode=='show')
            {
                track.css({
                    left:  xList[idx1][idx2][idx3]*wr+ww/2-25,
                    top:   yList[idx1][idx2][idx3]*hr+hh/2-25,
                });
            }
            
            track.css('display','');
        }
        catch(e)
        {

        }
    }

    //destory all the tracks
    var destoryTracks=function()
    {
        for(var i=0;i<tracks.length;i++)
        {
            tracks[i].css('display','none');
        }
    }



	//generate the code of colors
	var getRandomColor = function(){
		return  '#' + 
		(function(color){
			return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
			&& (color.length == 6) ?  color : arguments.callee(color); 
		})('');
	} 

	//get the max num of overlaps in time line of track
	var getMaxOverlap=function(list)
	{
        if(!list) return 0;
        var max=1;
        var points=[];
        for(var i=0;i<list.length;i++)
        {
            for(var j=0;j<list[i].length;j++)
            {
               points.push(list[i][j][0]);
               points.push(list[i][j][list[i][j].length-1]);
            }
        }
        points.sort(); 
        var middle=[];
        for(var i=0;i<points.length-1;i++)
        {
            var tmp=(points[i]+points[i+1])/2;
            middle.push(tmp);
        }
        for(var i=0;i<middle.length;i++)
        {
            var tmp=0;
            for(var j=0;j<list.length;j++)
            {
                for(var k=0;k<list[j].length;k++)
                {
                    if(middle[i]>=list[j][k][0]&&middle[i]<=list[j][k][list[j][k].length-1])
                    {
                       tmp++;
                       //break;
                       //我觉得break掉更快，但是调试的时候他就跳出整个循环了，无奈，只好不break
                    }
                }
            }
            if(max<tmp)max=tmp;
        }
        return max;
        /*
        if(!list) return 0;

		var len=list.length;
		var max=1;
		for(var i=0;i<len;i++)
		{
			var start=list[i][0][0];
			var end=list[i][list[i].length-1][list[i][list[i].length-1].length-1];
			var num=0;
			for(var j=0;j<len;j++)
			{
				if(i==j) continue;
                var in_st=list[j][0][0];
                var in_en=list[j][list[j].length-1][list[j][list[j].length-1].length-1];
				if( (in_st>start && in_st<end) ||
					(in_en>start && in_en<end ))
				{
					num++;
				}
				if(num>max)
				{
					max=num;
				}
			}
		}
		return max;*/
	}

    var findIdxByTime=function(time)
    {
        var len=timeList.length;
        var num=0;
        var i=0,j=0,k=0;
        var rtn=[];
        for(i=0;i<len;i++)
        {
            obTimeList=timeList[i];

            if(obTimeList[0]>time)
                break;

            if(obTimeList[obTimeList.length-1] < time)
                continue;

            for(j=0;j<obTimeList.length;j++)
            {
                var segObTimeList=obTimeList[j]; 
                if(segObTimeList[0]>time || segObTimeList[segObTimeList.length-1]<time)
                    continue;
                else
                {
                    for(k=0;k<segObTimeList.length-1;k++)
                    {
                        if(segObTimeList[k]<=time && segObTimeList[k+1] >time)
                        {
                            rtn.push([i,j,k,num]);
                            num++;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        return rtn;
    }



   
    return self;
}]);


