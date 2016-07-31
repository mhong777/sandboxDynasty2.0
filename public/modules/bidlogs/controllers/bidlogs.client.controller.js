'use strict';

// Bidlogs controller
angular.module('bidlogs').controller('BidlogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Bidlogs',
	function($scope, $stateParams, $location, Authentication, Bidlogs) {
		$scope.authentication = Authentication;

		// Create new Bidlog
		$scope.create = function() {
			// Create new Bidlog object
			var bidlog = new Bidlogs ({
				name: this.name
			});

			// Redirect after save
			bidlog.$save(function(response) {
				$location.path('bidlogs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Bidlog
		$scope.remove = function(bidlog) {
			if ( bidlog ) { 
				bidlog.$remove();

				for (var i in $scope.bidlogs) {
					if ($scope.bidlogs [i] === bidlog) {
						$scope.bidlogs.splice(i, 1);
					}
				}
			} else {
				$scope.bidlog.$remove(function() {
					$location.path('bidlogs');
				});
			}
		};

		// Update existing Bidlog
		$scope.update = function() {
			var bidlog = $scope.bidlog;

			bidlog.$update(function() {
				$location.path('bidlogs/' + bidlog._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Bidlogs
		$scope.find = function() {
			$scope.bidlogs = Bidlogs.query();
		};

		// Find existing Bidlog
		$scope.findOne = function() {
			$scope.bidlog = Bidlogs.get({ 
				bidlogId: $stateParams.bidlogId
			});
		};
	}
]);