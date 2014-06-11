angular.module('cwsTailgate.map.controller', ['cwsTailgate.map.service', 'google-maps'])
  .controller('MapCtrl', function($scope, cwsMapPoints, $log) {
    'use strict';

    var tempTeam = "cowboys";

    $scope.map = {
      center: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999',
      },
      zoom: 8
    };


    $scope.mapctrl = {
      tailgates: [],
      currentLocation: {},
      useCurrentLocation: true
    };


    $scope.newTailGate = {
      team: tempTeam
    };

    $scope.getTailGates = function() {
      cwsMapPoints.get().then(function(success) {
        //add id for google maps api
        for (var i = 0; i < success.length; i++){
          success[i].id = i;
        };

        $scope.mapctrl.tailgates = success;
        console.log(success);
      }, function(err) {
        console.log(err);
      });
    };

    $scope.getCurrentLocation = function() {
      cwsMapPoints.currentLocation().then(function(success) {

        $scope.mapctrl.currentLocation = success;
        $scope.currentLocationMarker = success;
        $scope.map.center = success.coords;
      }, function(err) {
        console.log(err);
      });
    }

    $scope.add = function(ntg) {
      if ($scope.mapctrl.useCurrentLocation) {
        ntg.coords = $scope.mapctrl.currentLocation.coords;
        ntg.time = $scope.mapctrl.currentLocation.timestamp;
        
      }

      cwsMapPoints.add(ntg).then(function(success) {

        $scope.newTailGate = {
          team: tempTeam
        };


      }, function(err) {
        console.log(err);
      }).then($scope.getTailGates());
    }

    //TODO: replace with configurable constant
    $scope.cwsMarker = {
      coords: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999'
      },
      label: 'Big Show Home',
      position: '(0,0)'
    };

    $scope.currentLocationMarker = {
      coords: {}
    };

    //init functions seperated for testability
    $scope.getTailGates();
    $scope.getCurrentLocation();
  });
