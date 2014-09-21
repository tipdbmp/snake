angular.module('app', [
    'ngRoute'
//  , 'ui.bootstrap'
  , 'app.ctrl.Snake'
//  , 'app.ctrl.B'
])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/snake', {
        templateUrl: 'snake/snake.html', controller: 'app.ctrl.Snake'
    })
//    .when('/B', {
//        templateUrl: 'B/B.html', controller: 'BCtrl'
//    })
    .otherwise({
        redirectTo: '/snake'
    });
}])
.controller('root', function($scope, $location) {
    $scope.tabhref = function(url) {
//        console.log($location.path());
        $location.path(url);
//        console.log($location.path());
    };
})
;
