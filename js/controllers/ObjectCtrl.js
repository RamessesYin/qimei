/**
 * Created by Ramesses on 2016/8/4
 */

var app = angular.module(PROJECT);


app.controller('ObjectCtrl',function($scope,$rootScope,$http,RESTClient,Category,URL,$stateParams)
{
    //init some necessary value
    $scope.FILE_URL=URL.FILE;
    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;
      $rootScope.proId=programId;
    $rootScope.epiId=episodeId;
    log(programId);
    var programInfo={};
    var object_id;
    $scope.types=['衣服','包','裤子','鞋子'];
    $scope.curType=0;
    $scope.mergeObject=null;
    var objects=[];
    var selected=[];
    var relates=[];
    $scope.curRelates=[];
    $scope.curObjects=[];
    $scope.name=null;
    $scope.selectedObjects=[];
    $scope.selectedRelate=null;
    $scope.sourceUrl=URL.RESOURCE;
    $scope.category=Category.category;  


    //get program by id
    RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){
            programInfo=data.programinfo;
            $scope.name=programInfo.name;
        });

    //get objectinfo by id
    var initGallery=function()
    {

        //get relate first
        RESTClient.getResource(URL.REQUEST+"relates/"+programId)
            .then(function (data){
    
                relates=data.relates;
                log(relates);
            });
       


       //init the gallery
        RESTClient.getResource(URL.REQUEST+"objects/"+programId,{video_id:episodeId})
            .then(function (data){


                //set the page size
                objects=[];
                $scope.curObjects=null;
                var M=5,N=4;
                var r=data.objects;
                var check=0;
                //get the relate_pic of the object 
                for(var i=0;i<r.length;i++)
                {
                    check=0;

                    for(var j=0;j<relates.length;j++)
                    {
                        if(r[i].relate_id==relates[j].relate_id)
                        {
                             r[i].relate_pic=relates[j].relate_pic;
                             check=1;
                        }
                    }
                    if(check==0)r[i].relate_pic="/file/404.jpg";
                   
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
                first: '<li class="first"><a href="javascript:void(0);">首页<\/a><\/li>',
                prev: '<li class="prev"><a href="javascript:void(0);"><i class="arrow arrow2"><\/i>上一页<\/a><\/li>',
                next: '<li class="next"><a href="javascript:void(0);">下一页<i class="arrow arrow3"><\/i><\/a><\/li>',
                last: '<li class="last"><a href="javascript:void(0);">末页<\/a><\/li>',
                page: '<li class="page"><a href="javascript:void(0);">{{page}}<\/a><\/li>',
                onPageChange: function (num, type) {
                    callback(num,type);
                               for(var i=0;i< $scope.selectedObjects.length;i++)
          {
             $("#object_pic_"+$scope.selectedObjects[i].object_id).addClass('relateSelected');
          }
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


    //choose the object to be the merge target
    $scope.setObject=function(object,$index)
    {
        var temp=$scope.mergeObject;
          $scope.mergeObject=object;
          $scope.selectedObjects.splice($index,1);
           var check=0;
      //return back the previous target
      for(var i=0;i<$scope.selectedObjects.length;i++)
      {
        if($scope.selectedObjects[i].object_id==temp.object_id)
        {
            check=1;break;
        }  
      }
      //the case that it is null
      if(check==0&&temp!=null)
      {
           $scope.selectedObjects.push(temp);
      log("插入后");
      log($scope.selectedObjects);
      }

    }
    
     //cancel the target  
    $scope.cancel_set=function()
    {
      
        log($scope.mergeObject);
        var check=0;

      for(var i=0;i<$scope.selectedObjects.length;i++)
      {
        if($scope.selectedObjects[i].object_id==$scope.mergeObject.object_id)
        {
            check=1;break;
        }  
      }
      //return back the origin target to the selected
      if(check==0)
      {
           $scope.selectedObjects.push($scope.mergeObject);
             $scope.mergeObject=null;
      log("插入后");
      log($scope.selectedObjects);
      }
    }
   

    //select the object to be merged
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

    //cancel the choice
    $scope.delObject=function(object,$index)
    {
        log("删除后");
     $scope.selectedObjects.splice($index,1);
     //cancel the mark
     $("#object_pic_"+object.object_id).removeClass('relateSelected');
     log($scope.selectedObjects);
    }


    //merge the selected object
    $scope.merge=function()
    {
        var object_list=null;
        if($scope.mergeObject!=null)object_list=$scope.mergeObject.object_id;
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
            object_list:object_list,
        }

        //send request
         RESTClient.updateResource(URL.REQUEST+'merge_objects/'+programId,request)
            .then(function(data){
                $scope.mergeObject=null;
                $scope.selectedObjects=null;
                 location.reload();
                log(data);
            });
    }


    initGallery();
});
