var userDemo = angular.module('userDemo', []);

function mainController($scope, $http){
  $scope.formData = {};

  $scope.login = function(){
    $http.post("/api/login")
         .success(function(data){
           $scope.formData = {};
           
         })
  }
}
