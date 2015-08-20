'use strict';

// Gvars controller
angular.module('gvars').controller('GvarsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Gvars', 'Owners',
	function($scope, $stateParams, $location, Authentication, Gvars, Owners) {
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

		$scope.startDraftOrder = function(){
			var x;
			x= $scope.gvar.draftOrder;
			$scope.draft=x;
		};

		$scope.addDraft = function(){
			$scope.draft.push(null);
		};

		$scope.changeDraft=function(index,pick){
			$scope.gvar.draftOrder.splice(index,1,pick._id);
		};

		// Find existing Gvar
		$scope.findOne = function() {
			$scope.gvar = Gvars.get({
				gvarId: $stateParams.gvarId
			});
			$scope.owners = Owners.query();
			$scope.draft;
		};
	}
]);