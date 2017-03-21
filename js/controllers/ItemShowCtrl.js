/**
 * Created by Ramesses on 2016/9/3
 */
var app = angular.module(PROJECT);


app.controller('ItemShowCtrl',function($scope,$rootScope,$http,RESTClient,Category,URL,$stateParams)
{
    //some necessary value
    $scope.FILE_URL=URL.FILE;
    $rootScope.curMode=3;
    
    var programId=$stateParams.programId;
    var episodeId=$stateParams.episodeId;


    $rootScope.proId=programId;
    $rootScope.epiId=episodeId;
    log(programId);
    var programInfo={};
    var item_id;
    var item_index;
    $scope.name=null;
    $scope.types=['衣服','包','裤子','鞋子'];
    $scope.itemType=null;
    $scope.curType=0;
    var relates=[];
    $scope.curRelates=[];
    $scope.selectedRelate=null;
    $scope.sourceUrl=URL.RESOURCE;
    $scope.category=Category.category;  


    //change the item type
    $scope.changeType=function(item)
    {
        $scope.curType=item;
        initGallery();
        log($('img').attr('src'));
    }

    //get program info by id
    RESTClient.getResource(URL.REQUEST+"program/"+programId)
        .then(function (data){
            programInfo=data.programinfo;
            $scope.name=programInfo.name;
        });
    

    //init the page
    var initGallery=function()
    {
        //init the gallery
         RESTClient.getResource(URL.REQUEST+'types')
        .then(function(data){
            if(data)
            {
                log("类型");
                log(data);
                $scope.types=data.types;
                $scope.itemType=$scope.types[$scope.curType].type;
            }
        });

        //get relates
        RESTClient.getResource(URL.REQUEST+"relates/"+programId,{type:$scope.curType})
            .then(function (data){

                relates=[];
                $scope.curRelates=null;
            //set the qunantity of pictures to show
                var M=4,N=3;
    
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
                initPaginator(relates.length,function(num,type){
                    try{
                        $scope.curRelates=relates[num-1];
                        $scope.$apply();
                        
                    }
                    catch(e)
                    {
                        log(e);
                    }
                });
            });
    }

    //set the page size and jump
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

    //show the edit modal
     $scope.showEditItemModal=function(item,$index)
    {
        //set the default value
        $scope.editItemInfo={
            relate_pic:"",
            type:$scope.curType,
            abstract:item.abstract,
            price:item.price,
            location:item.location,
            inventory:item.inventory,
            display:item.display,
            relate_url:item.relate_url,
            relate_screen:item.relate_screen,
            title:item.title,
            relate_pic_path:item.relate_pic,
            remark:programInfo.remark,
        }

        //set the id for use later
        item_id=item.relate_id;
        item_index=$index;
        $("#editItemModal").modal();
    }


      $scope.showMore=function(item,$index)
    {
        window.open("index.html#detail/"+programId+'/'+item.relate_id);

    }
   
    //del the item
     $scope.delItem=function(item,$index)
    {

        RESTClient.deleteResource(URL.REQUEST+'relate/'+programId+'/'+item.relate_id)
            .then(function(data){
             log($index);
             //update in the page
             $scope.curRelates.splice($index,1);
            });
    }
    
    //update an item
    $scope.updateItem=function(editItemInfo)
    {
        log( $scope.curRelates[item_index]);
        

        //read the picture
        var input = document.getElementById("relate_pic");
        var file = input.files[0];
        log(file);
        if(file!=null){
            //check if the filereader can be used
             if ( typeof(FileReader) === 'undefined' )
             {
               log("bad version of explorer")
               input.setAttribute( 'disabled','disabled' );
             } 
             else
             {
                //check the type of the file
           
                 log("start to read file");
                 if(!/image\/\w+/.test(file.type))
                 { 
                    alert("请确保文件为图像类型");
                    return false;
                 }

                 //init the reader
                 var reader = new FileReader();
                 reader.readAsDataURL(file);
                 log(reader);
                 log("succeed to read file");
                 //when the onload is ended
                 reader.onload = function(e){
                     var result=reader.result;
                     log("get text");
                     log(result);
                     log(reader);
                     editItemInfo.relate_pic=result;
                     editItemInfo.relate_pic_path="";
                      log(editItemInfo);

                      //send request
                     RESTClient.updateResource(URL.REQUEST+'relate/'+programId+'/'+item_id,editItemInfo)
                      .then(function(data){
                              $("#editItemModal").modal('hide');
                               log(data);

                               //update in the page without reload
                               $scope.curRelates[item_index].relate_pic=data.relate_pic;
                               $scope.curRelates[item_index].type=editItemInfo.type;
                               $scope.curRelates[item_index].abstract=editItemInfo.abstract;
                               $scope.curRelates[item_index].price=editItemInfo.price;
                               $scope.curRelates[item_index].location=editItemInfo.location;
                               $scope.curRelates[item_index].inventory=editItemInfo.inventory;
                               $scope.curRelates[item_index].display=editItemInfo.display;
                               $scope.curRelates[item_index].relate_url=editItemInfo.relate_url;
                               $scope.curRelates[item_index].relate_screen=editItemInfo.relate_screen;
                               $scope.curRelates[item_index].title=editItemInfo.title;
                               $scope.curRelates[item_index].relate_pic_path=editItemInfo.relate_pic_path;
                         });
                 }
             }
        }
        else
        {
             log(editItemInfo);
             //send request
             RESTClient.updateResource(URL.REQUEST+'relate/'+programId+'/'+item_id,editItemInfo)
          .then(function(data){
                              $("#editItemModal").modal('hide');
                              log("next is data");
                              log(data);
                                $scope.curRelates[item_index].relate_pic=editItemInfo.relate_pic_path;
                               $scope.curRelates[item_index].type=editItemInfo.type;
                               $scope.curRelates[item_index].abstract=editItemInfo.abstract;
                               $scope.curRelates[item_index].price=editItemInfo.price;
                               $scope.curRelates[item_index].location=editItemInfo.location;
                               $scope.curRelates[item_index].inventory=editItemInfo.inventory;
                               $scope.curRelates[item_index].display=editItemInfo.display;
                               $scope.curRelates[item_index].relate_url=editItemInfo.relate_url;
                               $scope.curRelates[item_index].relate_screen=editItemInfo.relate_screen;
                               $scope.curRelates[item_index].title=editItemInfo.title;
                               $scope.curRelates[item_index].relate_pic_path=editItemInfo.relate_pic_path;
                         });
        }

    }

    //show the add modal
    $scope.showAddItemModal=function()
    {
        $scope.addItemInfo={
            relate_pic:"",
            type:$scope.curType,
            abstract:"",
            price:"",
            location:"",
            inventory:"",
            display:"",
            relate_url:"",
            relate_screen:"",
            title:"",
            remark:programInfo.remark,

        }
        $("#addItemModal").modal();
    }
     
 


    
    // to add an item
     $scope.addItem=function(addItemInfo)
     { 
        log(addItemInfo);
        var input = document.getElementById("relate_Pic");
        var input1 = document.getElementById("Relate_pic");
        var file = input.files[0];
        var file1=input1.files[0];
         log(file);
          log(file1);


          if($scope.itemType!=1)
          {
        if ( typeof(FileReader) === 'undefined' )
        {
         log("bad version of explorer")
         input.setAttribute( 'disabled','disabled' );
        } 
        else
        {
           log("start to read file");
           if(!/image\/\w+/.test(file.type)||!/image\/\w+/.test(file1.type))
           { 
                alert("请确保文件为图像类型");
           }
           else
           {
            var reader = new FileReader();
            var reader1 = new FileReader();
            reader.readAsDataURL(file);
             reader1.readAsDataURL(file1);
        
            reader.onload = function(e){
                var result=reader.result;
                 addItemInfo.relate_pic=result;

                reader1.onload = function(e){
                var result=reader1.result;
                
                addItemInfo.relate_screen=result;
                log(addItemInfo);
                RESTClient.addResource(URL.REQUEST+'relates/'+programId,addItemInfo)
                  .then(function(data){
                    $("#addItemModal").modal('hide');
                    log(data);
                    window.open("index.html#detail/"+programId+'/'+data.relate_id);
                    initGallery();
                });
               
 

              }
             
        
           }
        }

     }
          }
          else
          {

            log(addItemInfo);
                RESTClient.addResource(URL.REQUEST+'relates/'+programId,addItemInfo)
                  .then(function(data){
                    $("#addItemModal").modal('hide');
                    log(data);
                    window.open("index.html#detail/"+programId+'/'+data.relate_id);
                    initGallery();
                });

          }
     
    }

    
    //add items through file
    $scope.showAddItemsModal=function()
    {
        $scope.addItemsInfo={
            remark:programInfo.remark,
            taobao_file:"",
        }
        $("#addItemsModal").modal();
    }

     $scope.addItems=function(addItemsInfo)
    {    
        log(addItemsInfo);
        RESTClient.addResource(URL.REQUEST+'relates_add/'+programId,addItemsInfo)
            .then(function(data){
                $("#addItemsModal").modal('hide');
                 initGallery();
        });
    }
    initGallery();
});