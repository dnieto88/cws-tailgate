angular.module('cwsTailgate', [
  'ngRoute',
  'ngTouch',
  'cwsTailgate.map',
  'cws-tailgate-templates',
  'mongolabResourceHttp',
  'mm.foundation'
])
  .config(function($routeProvider) {
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
