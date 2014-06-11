
angular.module('cwsTailgate', [
  'ngRoute',
  'cwsTailgate.map',
  'cws-tailgate-templates'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/map', {
      controller: 'MapCtrl',
      templateUrl: '/cws-tailgate/map/map.html'
    })
    .otherwise({
      redirectTo: '/map'
    });
});
