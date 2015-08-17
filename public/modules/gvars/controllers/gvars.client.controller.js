'use strict';

// Gvars controller
angular.module('gvars').controller('GvarsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Gvars',
	function($scope, $stateParams, $location, Authentication, Gvars) {
		$scope.authentication = Authentication;

		// Create new Gvar
		$scope.create = function() {
			// Create new Gvar object
			var gvar = new Gvars ({
				name: this.name
			});

			// Redirect after save
			gvar.$save(function(response) {
				$location.path('gvars/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Gvar
		$scope.remove = function(gvar) {
			if ( gvar ) { 
				gvar.$remove();

				for (var i in $scope.gvars) {
					if ($scope.gvars [i] === gvar) {
						$scope.gvars.splice(i, 1);
					}
				}
			} else {
				$scope.gvar.$remove(function() {
					$location.path('gvars');
				});
			}
		};

		// Update existing Gvar
		$scope.update = function() {
			var gvar = $scope.gvar;

			gvar.$update(function() {
				$location.path('gvars/' + gvar._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Gvars
		$scope.find = function() {
			$scope.gvars = Gvars.query();
		};

		// Find existing Gvar
		$scope.findOne = function() {
			$scope.gvar = Gvars.get({ 
				gvarId: $stateParams.gvarId
			});
		};
	}
]);