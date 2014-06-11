 describe('Map', function() {
   var $scope;

   beforeEach(module('cwsTailgate.map.controller'));

   beforeEach(inject(function($rootScope) {
     $scope = $rootScope;
   }));

   describe('Map: controller', function() {

     var ctrl;
     beforeEach(inject(function($controller, _cwsMapPoints_) {

       ctrl = function() {
         return $controller('MapCtrl', {
           $scope: $scope,
           cwsMapPoints: _cwsMapPoints_
         });
       }
     }));


     it("should initialize", function() {
       expect(ctrl()).not.toBe(null);
     });


     it("should get tailgates and location on load", function() {

       spyOn($scope, 'getTailGates').andCallFake(function(){});
       spyOn($scope, 'getCurrentLocation').andCallFake(function(){});
        ctrl();

       expect($scope.getCurrentLocation).toHaveBeenCalled();
       expect($scope.getTailGates).toHaveBeenCalled();
     });


     it("should be able to add a tailgate with current location",function(){
        ctrl();
        $scope.mapctrl.currentLocation = {
          coords: {
            latitude: 1,
            longitude: 1
          }

        };

        $scope.add({
          name: 'dan'
        });
        
     });

   });
 });
