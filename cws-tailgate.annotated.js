angular.module('mongolabResourceHttp', []).factory('$mongolabResourceHttp', [
  'MONGOLAB_CONFIG',
  '$http',
  '$q',
  function (MONGOLAB_CONFIG, $http, $q) {
    function MmongolabResourceFactory(collectionName) {
      var config = angular.extend({ BASE_URL: 'https://api.mongolab.com/api/1/databases/' }, MONGOLAB_CONFIG);
      var dbUrl = config.BASE_URL + config.DB_NAME;
      var collectionUrl = dbUrl + '/collections/' + collectionName;
      var defaultParams = { apiKey: config.API_KEY };
      var resourceRespTransform = function (data) {
        return new Resource(data);
      };
      var resourcesArrayRespTransform = function (data) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
          result.push(new Resource(data[i]));
        }
        return result;
      };
      var promiseThen = function (httpPromise, successcb, errorcb, fransformFn) {
        return httpPromise.then(function (response) {
          var result = fransformFn(response.data);
          (successcb || angular.noop)(result, response.status, response.headers, response.config);
          return result;
        }, function (response) {
          (errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
          return $q.reject(response.data);
        });
      };
      var preparyQueryParam = function (queryJson) {
        return angular.isObject(queryJson) && !angular.equals(queryJson, {}) ? { q: JSON.stringify(queryJson) } : {};
      };
      var Resource = function (data) {
        angular.extend(this, data);
      };
      Resource.query = function (queryJson, options, successcb, errorcb) {
        var prepareOptions = function (options) {
          var optionsMapping = {
              sort: 's',
              limit: 'l',
              fields: 'f',
              skip: 'sk'
            };
          var optionsTranslated = {};
          if (options && !angular.equals(options, {})) {
            angular.forEach(optionsMapping, function (targetOption, sourceOption) {
              if (angular.isDefined(options[sourceOption])) {
                if (angular.isObject(options[sourceOption])) {
                  optionsTranslated[targetOption] = JSON.stringify(options[sourceOption]);
                } else {
                  optionsTranslated[targetOption] = options[sourceOption];
                }
              }
            });
          }
          return optionsTranslated;
        };
        if (angular.isFunction(options)) {
          errorcb = successcb;
          successcb = options;
          options = {};
        }
        var requestParams = angular.extend({}, defaultParams, preparyQueryParam(queryJson), prepareOptions(options));
        var httpPromise = $http.get(collectionUrl, { params: requestParams });
        return promiseThen(httpPromise, successcb, errorcb, resourcesArrayRespTransform);
      };
      Resource.all = function (options, successcb, errorcb) {
        if (angular.isFunction(options)) {
          errorcb = successcb;
          successcb = options;
          options = {};
        }
        return Resource.query({}, options, successcb, errorcb);
      };
      Resource.count = function (queryJson, successcb, errorcb) {
        var httpPromise = $http.get(collectionUrl, { params: angular.extend({}, defaultParams, preparyQueryParam(queryJson), { c: true }) });
        return promiseThen(httpPromise, successcb, errorcb, function (data) {
          return data;
        });
      };
      Resource.distinct = function (field, queryJson, successcb, errorcb) {
        var httpPromise = $http.post(dbUrl + '/runCommand', angular.extend({}, queryJson || {}, {
            distinct: collectionName,
            key: field
          }), { params: defaultParams });
        return promiseThen(httpPromise, successcb, errorcb, function (data) {
          return data.values;
        });
      };
      Resource.getById = function (id, successcb, errorcb) {
        var httpPromise = $http.get(collectionUrl + '/' + id, { params: defaultParams });
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };
      Resource.getByObjectIds = function (ids, successcb, errorcb) {
        var qin = [];
        angular.forEach(ids, function (id) {
          qin.push({ $oid: id });
        });
        return Resource.query({ _id: { $in: qin } }, successcb, errorcb);
      };
      //instance methods
      Resource.prototype.$id = function () {
        if (this._id && this._id.$oid) {
          return this._id.$oid;
        } else if (this._id) {
          return this._id;
        }
      };
      Resource.prototype.$save = function (successcb, errorcb) {
        var httpPromise = $http.post(collectionUrl, this, { params: defaultParams });
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };
      Resource.prototype.$update = function (successcb, errorcb) {
        var httpPromise = $http.put(collectionUrl + '/' + this.$id(), angular.extend({}, this, { _id: undefined }), { params: defaultParams });
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };
      Resource.prototype.$remove = function (successcb, errorcb) {
        var httpPromise = $http['delete'](collectionUrl + '/' + this.$id(), { params: defaultParams });
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };
      Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
        if (this.$id()) {
          return this.$update(updatecb, errorUpdatecb);
        } else {
          return this.$save(savecb, errorSavecb);
        }
      };
      return Resource;
    }
    return MmongolabResourceFactory;
  }
]);
(function (module) {
  try {
    module = angular.module('cws-tailgate-templates');
  } catch (e) {
    module = angular.module('cws-tailgate-templates', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('/cws-tailgate/map/map.html', '<div class="alert-bar"><alert ng-repeat="alert in alerts | limitTo: 1" type="alert.type" close="closeAlert($index)">{{alert.msg}}</alert></div><small class="error" ng-hide="mapctrl.hasLocation">Unable to grab your current locaiton</small><div class="begin" ng-hide="mapctrl.selectedTeam"><div class="row"><div class="small-12 columns"><div class="panel"><p>Select A Team To Begin</p></div></div></div></div><div class="row"><div class="small-12 medium-4 columns end"><select ng-model="mapctrl.selectedTeam" ng-options="t as t for t in mapctrl.teams" ng-change="getTailGates()"><option value="">-- Select a Team--</option></select></div></div><div ng-if="mapctrl.selectedTeam"><div class="row"><google-map center="map.center" zoom="map.zoom" draggable="false" pan="true" class="small-12 large-12 columns end"><marker coords="currentLocationMarker.coords"><marker-label content="&quot;You are Here&quot;" anchor="0 0" class="tailgate-label"></marker-label></marker><marker coords="cwsMarker.coords" icon="cwsMarker.icon"><marker-label content="cwsMarker.label" anchor="0 0" class="tailgate-label"></marker-label></marker><marker coords="busMarker.coords" icon="busMarker.icon"><marker-label content="busMarker.label" anchor="0 0" class="bus-label"></marker-label></marker><markers models="mapctrl.tailgates" coords="\'coords\'" labelcontent="\'name\'" labelanchor="0 0" labelclass="tailgate-label" icon="\'icon\'" click="showDetails(m)"></markers></google-map></div><div class="row"><div class="small-12 medium-6 columns"><div class="panel primary add-team-form"><h2>{{mapctrl.selectedTeam}} Tailgate</h2><p class="alert-panel" ng-hide="mapctrl.tailgates">There are no Tailgate for {{mapctrl.selectedTeam}} yet. Be the first to start the party</p><div ng-repeat="tg in mapctrl.tailgates" class="tailgate-list">{{tg.name}} | {{tg.time | date}} | <a ng-click="removeLocation(tg)">Stop this bus</a></div></div></div><div class="small-12 medium-6 columns"><div class="panel primary add-team-form"><h2>Add Tailgate</h2><form name="form" novalidate=""><div class="row"><label>Name:<input type="text" ng-model="newTailGate.name" ng-required="true" placeholder="Give Your Tail Gate A Name" tab-index="0"></label></div><div class="row"><label>Team:<input type="text" ng-model="newTailGate.team" ng-required="true" placeholder="Your Favorite Team" tab-index="1" typeahead="team for team in mapctrl.teams | filter:$viewValue | limitTo:8" typeahead-editable="false"></label></div><div class="row"><label><input type="checkbox" ng-model="mapctrl.useCurrentLocation" ng-disabled="true">Use Current Location</label></div><div class="row"><button class="expand" ng-click="add(newTailGate)" ng-disabled="form.$invalid">Add Tail Gate</button></div></form></div></div></div></div>');
    }
  ]);
}());
angular.module('cwsTailgate.map.service', ['mongolabResourceHttp']).constant('MONGOLAB_CONFIG', {
  API_KEY: 'rQxsZ4OjiJ_6cxUf40Heixvdm8oZg0dT',
  DB_NAME: 'cws-tail-gating'
}).factory('cwsMapPoints', [
  '$mongolabResourceHttp',
  '$window',
  '$q',
  function ($mongolabResourceHttp, $window, $q) {
    var mongo = $mongolabResourceHttp('tailgates');
    var get = function (team) {
      var team = team || '';
      return mongo.query({ 'team': team });
    };
    var add = function (tailgate) {
      if (!!tailgate.useCurrentLocation) {
        delete tailgate.useCurrentLocation;
      }
      var newTailGate = new mongo(tailgate);
      return newTailGate.$saveOrUpdate();
    };
    var getAllTeamsWithTailGates = function () {
      return mongo.distinct('team');
    };
    //Should be extracted to a service
    var getAllTeams = function () {
      var deferred = $q.defer();
      deferred.resolve([
        'UC-Irvine',
        'Texas',
        'Lousiville',
        'Vanderbilt',
        'Texas Tech',
        'TCU',
        'Virginia',
        'Mississippi'
      ]);
      return deferred.promise;
    };
    var currentLocation = function () {
      var deferred = $q.defer();
      if (!angular.isDefined($window.navigator.geolocation)) {
        console.log('No geolocation');
        deferred.reject('No geolocation available');
      } else {
        $window.navigator.geolocation.getCurrentPosition(function (success) {
          console.log('Got location -> ', success);
          deferred.resolve(success);
        }, function (err) {
          deferred.reject(err);
        });
      }
      return deferred.promise;
    };
    return {
      get: get,
      getAllTeams: getAllTeams,
      add: add,
      currentLocation: currentLocation
    };
  }
]);
angular.module('cwsTailgate.map.controller', [
  'cwsTailgate.map.service',
  'google-maps'
]).controller('MapCtrl', [
  '$scope',
  'cwsMapPoints',
  '$log',
  function ($scope, cwsMapPoints, $log) {
    'use strict';
    $scope.alerts = [];
    $scope.closeAlert = function (i) {
      $scope.alerts.splice(i, 1);
    };
    $scope.map = {
      center: {
        latitude: '41.1757071',
        longitude: '-96.01572449999999'
      },
      zoom: 13
    };
    $scope.mapctrl = {
      tailgates: [],
      currentLocation: {},
      useCurrentLocation: true,
      teams: [],
      selectedTeam: '',
      hasLocation: false
    };
    $scope.newTailGate = { team: '' };
    $scope.getTeams = function () {
      cwsMapPoints.getAllTeams().then(function (success) {
        $scope.mapctrl.teams = success;  //$scope.mapctrl.selectedTeam = success[0];
      }, function (err) {
        $log.error(err);
      });
    };
    $scope.getTailGates = function () {
      //prefill in the team name with team whos tailgates we searched
      $scope.newTailGate.team = $scope.mapctrl.selectedTeam;
      cwsMapPoints.get($scope.mapctrl.selectedTeam).then(function (success) {
        //todo: clean this up consider storing in data base?
        for (var i = 0; i < success.length; i++) {
          success[i].id = i;
          if (!success[i].icon) {
            success[i].icon = 'assets/beer.png';
          }
        }
        $scope.mapctrl.tailgates = success;
      }, function (err) {
        $log.error(err);
      });
    };
    $scope.removeLocation = function (tailgate) {
      tailgate.$remove().then(function (success) {
        $scope.alerts.push({
          type: 'success',
          msg: 'The party is over.'
        });
      }, function (err) {
        $scope.alerts.push({
          type: 'error',
          msg: 'This party just wont stop'
        });
      }).then($scope.getTailGates());
    };
    //get users geolocation
    //if you find location center the map on it
    //else center map on ultra mega party bus
    $scope.getCurrentLocation = function () {
      cwsMapPoints.currentLocation().then(function (success) {
        $scope.mapctrl.hasLocation = true;
        $scope.mapctrl.currentLocation = success;
        $scope.currentLocationMarker = success;
        $scope.map.center = success.coords;
      }, function (err) {
        $scope.mapctrl.currentLocation = $scope.busMarker;
        $scope.map.center = $scope.busMarker.coords;
        $log.error(err);
      });
    };
    $scope.add = function (ntg) {
      if ($scope.mapctrl.useCurrentLocation) {
        ntg.coords = $scope.mapctrl.currentLocation.coords;
        ntg.time = $scope.mapctrl.currentLocation.timestamp;
      }
      cwsMapPoints.add(ntg).then(function (success) {
        $scope.newTailGate = { team: $scope.mapctrl.selectedTeam };
        $scope.alerts.push({
          type: 'success',
          msg: 'Tailgate succesfully added!'
        });
      }, function (err) {
        $scope.alerts.push({
          type: 'danger',
          msg: err
        });
      }).then($scope.getTailGates());
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
    $scope.currentLocationMarker = { coords: {} };
    //init functions seperated for testability
    //$scope.getTailGates();
    $scope.getCurrentLocation();
    $scope.getTeams();
  }
]);
angular.module('cwsTailgate.map', [
  'cwsTailgate.map.controller',
  'cwsTailgate.map.service'
]);
angular.module('cwsTailgate', [
  'ngRoute',
  'ngTouch',
  'cwsTailgate.map',
  'cws-tailgate-templates',
  'mongolabResourceHttp',
  'mm.foundation'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    'use strict';
    $routeProvider.when('/map', {
      controller: 'MapCtrl',
      templateUrl: '/cws-tailgate/map/map.html'
    }).otherwise({ redirectTo: '/map' });
  }
]);