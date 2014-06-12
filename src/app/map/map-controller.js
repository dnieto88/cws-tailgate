angular.module('cwsTailgate.map.controller', ['cwsTailgate.map.service', 'google-maps'])
  .controller('MapCtrl', function($scope, cwsMapPoints, $log, $tour) {
    'use strict';

    $scope.alerts = [];

    $scope.closeAlert = function(i) {
      $scope.alerts.splice(i, 1);
    };

    $scope.map = {
      center: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999',
      },
      zoom: 13,
      control: {},
      events: {
        tilesloaded: function(map) {
          $scope.$apply(function() {
         
      
            $log.info('this is the map instance', map);
          });
        }
      },
      options: {
        panControl: true
      }
    };

 
    $scope.mapctrl = {
      tailgates: [],
      currentLocation: {},
      useCurrentLocation: true,
      teams: [],
      selectedTeam: '',
      hasLocation: false
    };

    $scope.newTailGate = {
      team: ''
    };

    $scope.getTeams = function() {

      cwsMapPoints.getAllTeams().then(function(success) {

        $scope.mapctrl.teams = success;
        //$scope.mapctrl.selectedTeam = success[0];
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.getTailGates = function() {

      //prefill in the team name with team whos tailgates we searched
      $scope.newTailGate.team = $scope.mapctrl.selectedTeam;

      cwsMapPoints.get($scope.mapctrl.selectedTeam).then(function(success) {
        //todo: clean this up consider storing in data base?
        for (var i = 0; i < success.length; i++) {
          success[i].id = i;
          if (!success[i].icon) {
            success[i].icon = 'assets/beer.png';
          }
        }


        $scope.mapctrl.tailgates = success;

      }, function(err) {
        $log.error(err);
      });
    };

    $scope.removeLocation = function(tailgate) {
      tailgate.$remove().then(function(success) {
        $scope.alerts.push({
          type: 'success',
          msg: 'The party is over.'
        });

        $scope.getTailGates();
      }, function(err) {
        $scope.alerts.push({
          type: 'error',
          msg: 'This party just wont stop'
        });
      });
    };

    //get users geolocation
    //if you find location center the map on it
    //else center map on ultra mega party bus
    $scope.getCurrentLocation = function() {
      cwsMapPoints.currentLocation().then(function(success) {
        $scope.mapctrl.hasLocation = true;
        $scope.mapctrl.currentLocation = success;
        $scope.currentLocationMarker = success;
        $scope.map.center = success.coords;
      }, function(err) {
        angular.copy($scope.busMarker, $scope.mapctrl.currentLocation);
        angular.copy($scope.mapctrl.currentLocation, $scope.busMarker);
        //$scope.mapctrl.currentLocation = $scope.busMarker;
        $scope.map.center = {
          latitude: $scope.busMarker.coords.latitude,
          longitude: $scope.busMarker.coords.longitude
        };
        
        $log.error(err);
      });
    };


    $scope.add = function(ntg) {
      if ($scope.mapctrl.useCurrentLocation) {
        ntg.coords = $scope.mapctrl.currentLocation.coords;
        ntg.time = $scope.mapctrl.currentLocation.timestamp;

      }

      cwsMapPoints.add(ntg).then(function(success) {
        $scope.newTailGate = {
          team: $scope.mapctrl.selectedTeam
        };

        $scope.alerts.push({
          type: 'success',
          msg: 'Tailgate succesfully added!'
        });

        $scope.getTailGates();
      }, function(err) {
        $scope.alerts.push({
          type: 'danger',
          msg: err
        });

      })
   
    };

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
    $tour.start();
  });
