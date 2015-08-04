'use strict';

// Bids controller
angular.module('bids').controller('BidsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Bids',
	function($scope, $stateParams, $location, Authentication, Bids) {
		$scope.authentication = Authentication;

		// Create new Bid
		$scope.create = function() {
			// Create new Bid object
			var bid = new Bids ({
				name: this.name
			});

			// Redirect after save
			bid.$save(function(response) {
				$location.path('bids/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Bid
		$scope.remove = function(bid) {
			if ( bid ) { 
				bid.$remove();

				for (var i in $scope.bids) {
					if ($scope.bids [i] === bid) {
						$scope.bids.splice(i, 1);
					}
				}
			} else {
				$scope.bid.$remove(function() {
					$location.path('bids');
				});
			}
		};

		// Update existing Bid
		$scope.update = function() {
			var bid = $scope.bid;

			bid.$update(function() {
				$location.path('bids/' + bid._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Bids
		$scope.find = function() {
			$scope.bids = Bids.query();
		};

		// Find existing Bid
		$scope.findOne = function() {
			$scope.bid = Bids.get({ 
				bidId: $stateParams.bidId
			});
		};
	}
]);