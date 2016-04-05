'use strict';

// Hists controller
angular.module('hists').controller('HistsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Hists',
	function($scope, $stateParams, $location, Authentication, Hists) {
		$scope.authentication = Authentication;

		// Create new Hist
		$scope.create = function() {
			// Create new Hist object
			var hist = new Hists ({
				name: this.name
			});

			// Redirect after save
			hist.$save(function(response) {
				$location.path('hists/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Hist
		$scope.remove = function(hist) {
			if ( hist ) { 
				hist.$remove();

				for (var i in $scope.hists) {
					if ($scope.hists [i] === hist) {
						$scope.hists.splice(i, 1);
					}
				}
			} else {
				$scope.hist.$remove(function() {
					$location.path('hists');
				});
			}
		};

		// Update existing Hist
		$scope.update = function() {
			var hist = $scope.hist;

			hist.$update(function() {
				$location.path('hists/' + hist._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Hists
		$scope.find = function() {
			$scope.hists = Hists.query();
		};

		// Find existing Hist
		$scope.findOne = function() {
			$scope.hist = Hists.get({ 
				histId: $stateParams.histId
			});
		};
	}
]);