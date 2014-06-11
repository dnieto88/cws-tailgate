angular.module('cwsTailgate.map.controller', ['cwsTailgate.map.service', 'google-maps'])
  .controller('MapCtrl', function($scope, cwsMapPoints, $log) {
    'use strict';


    $scope.map = {
      center: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999',
      },
      zoom: 14
    };

    $scope.mapctrl = {
      tailgates: [],
      currentLocation: {},
      useCurrentLocation: true,
      teams: [],
      selectedTeam: ''
    };

    $scope.newTailGate = {
      team: ''
    };

    $scope.getTeams = function() {

      cwsMapPoints.getAllTeams().then(function(success) {
        console.log('get All teams', success);
        $scope.mapctrl.teams = success;
        //$scope.mapctrl.selectedTeam = success[0];
      }, function(err) {
        console.log(err);
      });
    };

    $scope.getTailGates = function() {
      console.log('Getting tailgates for team', $scope.mapctrl.selectedTeam);
      $scope.newTailGate.team = $scope.mapctrl.selectedTeam;
      cwsMapPoints.get($scope.mapctrl.selectedTeam).then(function(success) {
        //todo: clean this up consider storing in data base?
        for (var i = 0; i < success.length; i++) {
          success[i].id = i;
          if(!success[i].icon){
            success[i].icon = 'assets/beer.png';
          }
        };

        $scope.mapctrl.tailgates = success;
        console.log('tailgates: -> ',success);
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
          team: $scope.mapctrl.selectedTeam
        };


      }, function(err) {
        console.log(err);
      })
      //refresh map
      .then($scope.getTailGates());
    }

    //TODO: replace with configurable constant
    $scope.cwsMarker = {
      coords: {
        latitude: '41.2670',
        longitude: '-95.9320'
      },
      label: 'CWS',
      position: '0 0',
      icon: 'assets/star.png'

    };

    $scope.busMarker = {
      coords: {
        latitude: '41.280636', 
        longitude: '-95.912817'
      },
      label: 'ULTRA MEGA PARTY BUS 1988-?',
      position: '0 0',
      icon: 'assets/bus.png'
    };

    $scope.currentLocationMarker = {
      coords: {}
    };

    //init functions seperated for testability
    //$scope.getTailGates();
    $scope.getCurrentLocation();
    $scope.getTeams();
  });
