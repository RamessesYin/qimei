/**
 * Created by William on 2016/3/18 0018.
 */

var app = angular.module(PROJECT);

app.controller('CategoryCtrl',function($scope,$http,Category,RESTClient,$state,$stateParams)
{
	//可以考虑之后从后台获取数据
    $scope.cate=Category.getListById($stateParams.cateId);

	$scope.toBrief=function (id)
    {
        if($scope.curMode==3)
        {
            $state.go('itemShow',{programId:id});
        }
        else
        {
               $state.go('brief',{programId:id});
        }
     
    }

	
});