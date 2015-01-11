'use strict';

// Owners controller
angular.module('owners').controller('OwnersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners',
	function($scope, $stateParams, $location, Authentication, Owners ) {
		$scope.authentication = Authentication;

		// Create new Owner
		$scope.create = function() {
			// Create new Owner object
			var owner = new Owners ({
				name: this.name
			});

			// Redirect after save
			owner.$save(function(response) {
				$location.path('owners/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// Clear form fields
			this.name = '';
		};

		// Remove existing Owner
		$scope.remove = function( owner ) {
			if ( owner ) { owner.$remove();

				for (var i in $scope.owners ) {
					if ($scope.owners [i] === owner ) {
						$scope.owners.splice(i, 1);
					}
				}
			} else {
				$scope.owner.$remove(function() {
					$location.path('owners');
				});
			}
		};

		// Update existing Owner
		$scope.update = function() {
			var owner = $scope.owner ;

			owner.$update(function() {
				$location.path('owners/' + owner._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Owners
		$scope.find = function() {
			$scope.owners = Owners.query();
		};

		// Find existing Owner
		$scope.findOne = function() {
			$scope.owner = Owners.get({ 
				ownerId: $stateParams.ownerId
			});
		};
	}
]);