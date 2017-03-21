/**
 * Created by William on 2016/3/18
 * Modified by Ramesses on 2016 9/3
 */


var app = angular.module(PROJECT);


app.controller('NavbarCtrl',function($scope,$rootScope,$state)
{
    $scope.modes=['总体展示','任务下发','视频标注','商品管理','匹配'];
    $rootScope.curMode=0;
    $rootScope.addState=1;
    $rootScope.pageName=home;
    $rootScope.proId=null;
    $rootScope.epiId=null;
    $rootScope.help=null;

    $scope.back=function()
    {

       log(" click back"); 
       log($rootScope.pageName);
      if($rootScope.pageName=='brief')
      {
         $state.go('home');  
      }
      else if($rootScope.pageName=='category')
      {
         $state.go('home');  
      }
      else if($rootScope.pageName=='detail')
      {
         $state.go('itemShow',{programId:$rootScope.proId});   
      }
      else if($rootScope.pageName=='match')
      {
        $state.go('home');   
      }
      else if($rootScope.pageName=='home')
      {
        $state.go('home');  
      }
      else if($rootScope.pageName=='item')
      {
      $state.go('brief',{programId:$rootScope.proId});  
      }
      else if($rootScope.pageName=='itemShow')
      {
        $state.go('home');  
      }
       else if($rootScope.pageName=='task')
      {
        $state.go('home');  
      }
      else if($rootScope.pageName=='object')
      {
        $state.go('edit',{programId:$rootScope.proId,episodeId:$rootScope.epiId});   
      }
      else if($rootScope.pageName=='show')
      {
        $state.go('brief',{programId:$rootScope.proId});   
      }
      else if($rootScope.pageName=='video')
      {
        $state.go('brief',{programId:$rootScope.proId});   
      }
      else
      {
          $state.go('home');  
      }

    }



    $scope.changeMode=function(idx)
    {
        $rootScope.curMode=idx;
       
         log("修改模式")
         log($rootScope.pageName);
        if($rootScope.pageName=='show'||$rootScope.pageName=='video'||$rootScope.pageName=='item')
        {
        	if($rootScope.curMode==2)
        	{
        		  $rootScope.help='skip';
        		 $state.go('video',{programId:$rootScope.proId,episodeId: $rootScope.epiId});        		
        	}
        	if($rootScope.curMode==0)
        	{
        		  $rootScope.help='skip';
        		 $state.go('show',{programId:$rootScope.proId,episodeId: $rootScope.epiId});        		
        	}
        	if($rootScope.curMode==4)
        	{
        		  $rootScope.help='skip';
        		 $state.go('match',{programId:$rootScope.proId,episodeId: $rootScope.epiId});        		
        	}
          	if($rootScope.curMode==3)
        	{
        		  $rootScope.help='skip';
        		 $state.go('item',{programId:$rootScope.proId,episodeId: $rootScope.epiId});        		
        	}
            if($rootScope.curMode==1)
          {
           $state.go('brief',{programId:$rootScope.proId});            
          }
        } 

        if($rootScope.pageName=='detail')
        {

           $state.go('brief',{programId:$rootScope.proId});            
          
        } 
        if($rootScope.pageName=='brief')
        {
          if($rootScope.curMode==3)
          {
             $state.go('itemShow',{programId:$rootScope.proId});   
          }
          if($rootScope.curMode==4)
          {
            $state.go('match',{programId:$rootScope.proId})
          }
        }

        if($rootScope.pageName=='itemShow'||$rootScope.pageName=='match')
        {
          if($rootScope.curMode==2)
          {
              $rootScope.help='skip';
              $state.go('brief',{programId:$rootScope.proId});          
          }
          if($rootScope.curMode==0)
          {
              $rootScope.help='skip';
             $state.go('brief',{programId:$rootScope.proId});        
          }
          if($rootScope.curMode==1)
          {
              $rootScope.help='skip';
              $state.go('brief',{programId:$rootScope.proId}); 
          }
            if($rootScope.curMode==4)
          {
           $state.go('match',{programId:$rootScope.proId});            
          }
          if($rootScope.curMode==3)
          {
           $state.go('itemShow',{programId:$rootScope.proId});             
          }
        }  

    }
    //log($state.current);
});