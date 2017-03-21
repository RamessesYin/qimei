/**
 * Created by Ramesses on 2016/9/3
 */

var app = angular.module(PROJECT);


app.controller('DetailCtrl',function($scope,$rootScope,RESTClient,Category,$state,URL,TVPlay,$timeout,$stateParams,CanvasEdit,ScreenShot,Track)
{
    //some necessary value
    $scope.FILE_URL=URL.FILE;
    $rootScope.curMode=3;
    $scope.state=0;
    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;
     $rootScope.proId=programId;
    $rootScope.epiId=episodeId;


    $rootScope.displayType=null;
    log(programId);
    var programInfo={};
    var item_id;
    var item_index;
    $scope.curItem=null;
    $scope.name=null;

    var cronUpdate;


    var objects=[];
    var selected=[];
    var relates=[];
    $scope.curRelates=[];
    $scope.curObjects=[];
    $scope.itemType=null;
    $scope.types=null;

    $scope.selectedRelate=null;
    $scope.selectedObjects=[];
    $scope.sourceUrl=URL.RESOURCE;
    $scope.category=Category.category;
    var times=0;  
    var isNew=0;

    //get program info by id
    RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){
            programInfo=data.programinfo;
            $scope.name=programInfo.name;
            log(data);
        });

       

    var getState=function(){
        RESTClient.getResource(URL.REQUEST+"relate_state/"+programId,{relate_id:episodeId})
        .then(function (data){

            
            $scope.state=data;
            if(data==1)
            {
               if(times==0)isNew=1;
               times=0;

              initGallery();


            }
            else
            {
              if(times<30)
              {
                log("正在匹配第");
                log(times);
                log("次");
                times++;
                 cronUpdate=$timeout(function(){
                getState();
                },1000);            
              }
              else
              {
                  prompt('后台忙');
              }

              
           }
          
        });
    }


     //select the object to be uploaded
       $scope.upload=function()
       {

        var object_list=null;
        log("选中");
        log($scope.selectedObjects);
        if($scope.selectedObjects.length!=0)
        {
            for(var i=0;i<$scope.selectedObjects.length;i++)
        {
           if(object_list!=null)object_list+=',';
           object_list+=$scope.selectedObjects[i].object_id;
        }
        log("the array is");
        log(object_list);
        //init the value
        var request=
        {
            object_id_list:object_list,
            method:'PUT',
        }

        //send request
         RESTClient.updateResource(URL.REQUEST+"relate_objects/"+programId+'/'+episodeId,request)
            .then(function(data){
                 initRelate();
                 prompt('修改成功');
                 window.close();
            });
        }

       }
     

         $scope.del=function()
       {

         var object_list=null;
         

        if($scope.selectedObjects.length!=0)
        {
            for(var i=0;i<$scope.selectedObjects.length;i++)
        {
           if(object_list!=null)object_list+=',';
           object_list+=$scope.selectedObjects[i].object_id;
        }
        log("the array is");
        log(object_list);
        //init the value
        var request=
        {
            object_id_list:object_list,
            method:'DELETE',
        }
         log(request);
        //send request
         RESTClient.updateResource(URL.REQUEST+"relate_objects/"+programId+'/'+episodeId,request)
            .then(function(data){
                 initRelate();
                 prompt('删除成功');
            });
        }

       }




    $scope.selectObject=function(object)
    {
       var check=0;
       //ensure it hasn't been choosed
      for(var i=0;i<$scope.selectedObjects.length;i++)
      {
        if($scope.selectedObjects[i].object_id==object.object_id)
        {
            check=1;
            //cancel the mark
             $("#object_pic_"+$scope.selectedObjects[i].object_id).removeClass('relateSelected');
            $scope.selectedObjects.splice(i,1);

            break;

        }  
      }
      if(check==0)
      {
           $scope.selectedObjects.push(object);
      log("插入后");

      log($scope.selectedObjects);
      }
      //add a mark
      for(var i=0;i< $scope.selectedObjects.length;i++)
      {
          $("#object_pic_"+$scope.selectedObjects[i].object_id).addClass('relateSelected');
      }
   
    }

    var initRelate=function()
    {
        RESTClient.getResource(URL.REQUEST+"relates/"+programId)
            .then(function (data){
                
                relates=data.relates;
                for(var i=0;i<relates.length;i++)
                  {
                    if(relates[i].relate_id==episodeId)
                    {
                        $scope.curItem=relates[i];
                        
                        $scope.displayType=$scope.curItem.display;
                            RESTClient.getResource(URL.REQUEST+'types')
                         .then(function(rtn){              
                          $scope.types=rtn.types;
                          log("类型");
                          log($scope.types);
                          log(relates[i]);
                          log(relates[i].type);
                        $scope.itemType=$scope.types[relates[i].type].type;
                        log($scope.itemType);
                         if($scope.itemType!=1)
                        {
                          getState();
                        }
                        else
                        {
                          initGallery();
                        }

                          
                           });

                          
                       
                      break;

                    }
                  }  

            });

     
    }



    //get objectinfo by id
    var initGallery=function()
    {
       //init the gallery
        RESTClient.getResource(URL.REQUEST+"relate_objects/"+programId+'/'+episodeId)
            .then(function (data){


                //set the page size
                objects=[];
                $scope.curObjects=null;
                var M=1,N=4;
                var r=data.objects;
                
                if($scope.itemType!=1&&isNew==0)
                {
                  if(data.objects.length==0)
                {
                  prompt('未匹配到合适结果');
                  return; 
                }
                prompt('匹配完成'); 
                }
                
                 //set the array
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

                initPaginator(objects.length,function(num,type){
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
                        log(e);
                    }
                });
            });
    }

    //the page jumper
    var initPaginator=function(total,callback)
    {
        if(total>0)
        {
            log('total='+total);
            $('#jqPaginator').jqPaginator({
                totalPages: total,
                visiblePages: 5,
                currentPage: 1,
                prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
                next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
                onPageChange: function (num, type) {
                    callback(num,type);
                }
            });
        }
        else
        {
            try{
               $('#jqPaginator').jqPaginator('destroy'); 
            }
            catch(e)
            {
                //log(e);
            }
            
        }          
    }
    
    initRelate();     

});