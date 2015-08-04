'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Owners',
	function($scope, $http, $location, Users, Authentication, Owners) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Find a list of Owners
		$scope.initialize = function() {
			$scope.owners = Owners.query();
			if($scope.user.owner!=undefined || $scope.user.owner!=''){
				$location.path('/');
			}
		};

		$scope.setOwner = function(owner){
			$scope.owner=owner;
			$scope.owner.myUser=$scope.user._id;
			$scope.user.ownerId=owner._id;
		};

		$scope.associateOwner = function(){
			if($scope.owner===undefined){
				alert('you must select an account');
			}
			else{
				$scope.updateOwner();
				$scope.updateUserProfile();
				console.log($scope.owner);
			}
		};


		//filter if the owner has a user or not
		$scope.hasUserFilter = function (input) {
			if(input.myUser==undefined || input.myUser=='') {
				return true;
			}
			else{
				return false;
			}
		};




		// Update existing Owner
		$scope.updateOwner = function() {
			var owner = $scope.owner ;

			owner.$update(function() {
				console.log('owner updated');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function() {
			$scope.success = $scope.error = null;
			var user = new Users($scope.user);

			user.$update(function(response) {
				$scope.success = true;
				Authentication.user = response;
				console.log('user updated');
			}, function(response) {
				$scope.error = response.data.message;
			});
		};




	}
]);