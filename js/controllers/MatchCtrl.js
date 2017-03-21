/**
 * Created by Ramesses on 2016/9/3
 */


var app = angular.module(PROJECT);


app.controller('MatchCtrl',function($scope,$rootScope,RESTClient,Category,$state,URL,TVPlay,$timeout,$stateParams,CanvasEdit,ScreenShot,Track)
{
    $scope.FILE_URL=URL.FILE;
    $rootScope.curMode=4;
    var IsSet=null;
    var curIndex=null;
    var Index1=null;
    var Index2=null;
    var selRelate=null;
    var selObject=null;
    var curPage=1;
   
    var updateState=0;

    $scope.types=null;
    
    $scope.curType=0;
    

    var origin_pic="/file/404.jpg";

    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;


    $rootScope.proId=programId;
    $rootScope.epiId=episodeId;
    var programInfo={};

    var tmpRelates=[];
    
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

       $scope.changeType=function(item)
    {
        $scope.curType=item;
        initRelates();
        initObjects();

        log($('img').attr('src'));
    }
    
      RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){

            programInfo=data.programinfo;
            log("剧集");
            log(programInfo);
         });

      RESTClient.getResource(URL.REQUEST+'types')
        .then(function(data){
            if(data)
            {
                log("类型");
                log(data);
                $scope.types=data.types;
            }
        });

      $scope.update=function()
    {
        log("提交");
        log(selObject);
        var OBJECT=null;
         OBJECT={
                name:selObject.name,
                abstract:selObject.abstract,
                state:selObject.state,
                type:$scope.curType,
                object_pic:'',
                video_id:selObject.video_id,
                relate_id:selObject.relate_id,
                remark:programInfo.remark,
                object_pic_path:selObject.object_pic,
            }

         log(OBJECT);
         if(OBJECT.relate_id==-1)
         {
           OBJECT.state=0;
         }

        RESTClient.updateResource(URL.REQUEST+'object/'+programId+'/'+selObject.object_id,OBJECT)
         
         .then(function(data){


                    prompt('提交成功');
                    updateState=1;
                    $("#relate_pic_"+selRelate.relate_id).removeClass('relateSelected');
                    selRelate=null;


                         });



    }
     $scope.selectRelate=function(item,$index)
    {
        log("选商品");
        if(selRelate==null)
        {
            selRelate=item;
            if(IsSet!=null)
            {
              //origin_pic=$scope.curObjects[curIndex].relate_pic;

                  $scope.curObjects[curIndex].relate_pic=item.relate_pic;
            objects[Index1][Index2].relate_pic=item.relate_pic;
            selObject.relate_id=item.relate_id;
            }
          
            $("#relate_pic_"+item.relate_id).addClass('relateSelected');
        }
        else
        {
           $("#relate_pic_"+selRelate.relate_id).removeClass('relateSelected');
           if(selRelate!=item)
           {
               $("#relate_pic_"+item.relate_id).addClass('relateSelected');
               selRelate=item;
           if(IsSet!=null)
            {
              //origin_pic=$scope.curObjects[curIndex].relate_pic;
                 $scope.curObjects[curIndex].relate_pic=item.relate_pic;
            objects[Index1][Index2].relate_pic=item.relate_pic;
             selObject.relate_id=item.relate_id;
             //selObject.relate_pic=item.relate_pic;
            }

           }
           else
           {
             selRelate=null;

           }
          
        
        }

    }


    $scope.setObject=function(object,$index)
    {
        log("选中物品");
       if(IsSet==null)
       {
        log("不存在");
           $("#object_pic_"+object.object_id).addClass('relateSelected');
           IsSet=object.object_id;
            selObject=object;
           curIndex=$index;
           for(var i=0;i<objects.length;i++)
           {
            for(var j=0;j<objects[i].length;j++)
            {
                if(objects[i][j].object_id==object.object_id)
                {
                    Index1=i;
                    Index2=j;
                }
            }
           }
           origin_pic=$scope.curObjects[curIndex].relate_pic;


       }
       else
        {
            log("已存在");
           $("#object_pic_"+IsSet).removeClass('relateSelected');



           if(IsSet!=object.object_id)
           {
              $("#object_pic_"+object.object_id).addClass('relateSelected');

           IsSet=object.object_id;
            selObject=object;
            log("不同物品取消之前选项");
            if(updateState==0)
            {
             if(curPage==1)  $scope.curObjects[curIndex].relate_pic=origin_pic;
             objects[Index1][Index2].relate_pic=origin_pic;
            }
            else
            {
              updateState=0;
            }

            
           curIndex=$index;
           for(var i=0;i<objects.length;i++)
           {
            for(var j=0;j<objects[i].length;j++)
            {
                if(objects[i][j].object_id==object.object_id)
                {
                    Index1=i;
                    Index2=j;
                }
            }
           }
           origin_pic=$scope.curObjects[curIndex].relate_pic;

           }
           else
           {
            IsSet=null;
           selObject=null; 
           log("相同物品，取消恢复");
            if(updateState==0)
            {
            if(curPage==1) $scope.curObjects[curIndex].relate_pic=origin_pic;
             objects[Index1][Index2].relate_pic=origin_pic;
            }
            else
            {
              updateState=0;
            }
           }
            $("#relate_pic_"+selRelate.relate_id).removeClass('relateSelected');
                    selRelate=null;
        
       }

    }
   


   

    var initObjects=function()
    {

      RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){

            programInfo=data.programinfo;
            log("剧集");
            log(programInfo);
            RESTClient.getResource(URL.REQUEST+"objects/"+programInfo.remark,{type:$scope.curType})
            .then(function (data){

                objects=[];
                $scope.curObjects=[];

                var M=1,N=4;
                var r=data.objects;
                 //get the relate_pic of the object 
                 log(tmpRelates);
               
                for(var i=0;i<r.length;i++)
                {
                    if(r[i].relate_id==-1)r[i].relate_pic="/file/404.jpg";
                    else
                    {
                       for(var j=0;j<tmpRelates.length;j++)
                       {
                        if(r[i].relate_id==tmpRelates[j].relate_id&&r[i].relate_pic==null)
                        {
                          r[i].relate_pic==tmpRelates[j].relate_pic;
                        }

                       }
                    }                  
                 }

                 
             

             

              

                var i=0;
                var help=0;
                var tmp;
                while(help<r.length)
                {
                  help++;
                  if(r[i].relate_pic==null||r[i].relate_pic=="/file/404.jpg")
                  {
                    tmp=r[i];
                    r.splice(i,1);
                    r.push(tmp);
                    // if(help<30)
                    // {
                    //   log("fail to match the object,move it to the end");
                    //   log("origin is");
                    //   log(tmp);
                    //   log("next is");
                    //   log(r[i]);
                    //   log("the end is");
                    //   log(r[r.length-1]);
                    // }
                  }
                  else
                  {
                    // if(help<30)
                    // {
                    //   log("succeed to match");
                    //   log(r[i]);
                    // }
                    i++;
                  }
                }
             
                // var tmp=null;
                // var next=null;
                // var isEND=0;
                // for(;i<r.length-1;i++)
                // {
                //   next=i+1;
                //   while(r[i].relate_id==-1&&isEND!=1)
                //   {
                //     while(r[next].relate_id==-1&&isEND!=1)
                //     {
                //        next++;
                //        if(next==r.length-1)
                //        {
                //         isEND=1;
                //        }            
                //     }
                //     tmp=r[i];
                //     r[i]=r[next];
                //     r[next]=tmp;               
                //   }
                //   if(isEND==1)break;
                // }
                 i=0;
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
                         curPage=0;
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
         });






        
    }

    var initRelates=function()
    {
        //init the gallery
        RESTClient.getResource(URL.REQUEST+"relates/"+programId,{type:$scope.curType})
            .then(function (data){
                relates=[];
                $scope.curRelates=[];
                
                var M=6,N=4;
    
                var r=data.relates;
                tmpRelates=r;
                temp=
                {
                  relate_pic:"/file/404.jpg",
                  relate_id:-1,
                };
                r.unshift(temp);



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
                initObjects();
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
                    onPageChange: function (num, type) {
                        callback(num,type);
                         if(selObject)$("#object_pic_"+selObject.object_id).addClass('relateSelected');
                          if(selRelate)$("#relate_pic_"+selRelate.relate_id).addClass('relateSelected');

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




    initRelates();

 

});