 describe('Map', function() {
   var $scope;

   beforeEach(module('cwsTailgate.map.controller'));

   beforeEach(inject(function($rootScope) {
     $scope = $rootScope;
   }));

   describe('Map: controller', function() {

     var ctrl;
     beforeEach(inject(function($controller) {

       ctrl = $controller('MapCtrl', {
         $scope: $scope,
       });
     }));


     it("should initialize",function(){
     	expect(ctrl).not.toBe(null); 
     });


     it("should ",function(){
             
     });
   });
 });
