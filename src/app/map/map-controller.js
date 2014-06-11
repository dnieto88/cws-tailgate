angular.module('cwsTailgate.map.controller', ['google-maps'])
  .controller('MapCtrl', function($scope, $window) {
    'use strict';

    $scope.map = {
      center: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999',
      },
      zoom: 14
    };

    $scope.cwsMarker = {
      coords: {
              latitude: '41.1757071',
      longitude: '-96.01572449999999'
      },
      label: "Big Show Home",
      position: "(0,0)"
    };
  });
