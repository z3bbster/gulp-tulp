//comment here
angular.module('myApp', [
	'ui.router',
	'ngAnimate',
	'angular-loading-bar',
	'cfp.hotkeys',
])
.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/home");
  //
  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "scripts/home/home.tmpl.html",
      controller: function($scope){
      }
    })
    .state('help', {
      url: "/help",
      templateUrl: "scripts/help/help.tmpl.html",
      controller: function($scope) {
        $scope.items = ["A", "List", "Of", "Items"];
      }
    });
})
//comment here
.constant('ror', 'Wassup?')

.controller('homeCtrl', ['$scope', '$http', 'hotkeys','$state', function($scope, $http,hotkeys, $state){
	//comment here
	$scope.title = '1234500';
	console.log('hai');
	hotkeys.bindTo($scope)
	.add({
	    combo: 'ctrl+f1',
	    description: 'Test if this shortcut works',
	    callback: function() {
	      console.log('hotkeys ctrl+up detected!');
	      $state.go('help');
	    }
	 })
	.add({
	    combo: 'ctrl+f2',
	    description: 'Goto home',
	    callback: function() {
	      console.log('hotkeys ctrl+up detected!');
	      $state.go('home');
	    }
	 });
}])

.controller('NameCtrl', ['$scope', function ($scope) {
	//comment here
	console.log('hai')
}])
//comment here 
.directive('test', ['$http', function ($http) {
	return {
		restrict: 'A',
		templateUrl: '../views/test.tmpl.html',
		link: function (scope, iElement, iAttrs) {
			console.log('hai');
		}
	}; 
}])
//comment here
.factory('fact',  ['ror', function (ror) {
	return {  
	};
}]);
//comment here
var e = 'abc';
//comment here
console.log('hai');

/**
 * @ngdoc directive
 * @name rfx.directive:rAutogrow
 * @element textarea
 * @function
 *
 * @description
 * Resize textarea automatically to the size of its text content.
 *
 * **Note:** ie<9 needs pollyfill for window.getComputedStyle
 *
 * @example
   <example module="rfx">
     <file name="index.html">
         <textarea ng-model="text"rx-autogrow class="input-block-level"></textarea>
         <pre>{{text}}</pre>
     </file>
   </example>
 */
angular.module('rfx', []).directive('rAutogrow', function() {
  //some nice code
});

/**
 * @ngdoc directive
 * @name voam.directive:stopIt
 * @element div
 * @function
 *
 * @description
 * Manipulates a div as you desire.
 *
 *
 * @example
   <example module="voam">
     <file name="index.html">
         <div ng-model="text" rx-autogrow class="input-block-level"></div>
         <pre>{{text}}</pre>
     </file>
   </example>
 */
angular.module('voam', []).directive('stopIt', function() {
  //some nice code
});
