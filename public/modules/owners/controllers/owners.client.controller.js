'use strict';

// Owners controller
angular.module('owners').controller('OwnersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', 'Users',
	function($scope, $stateParams, $location, Authentication, Owners, $http, Users ) {
		$scope.authentication = Authentication;

		// Create new Owner
		$scope.create = function() {
			// Create new Owner object
			var owner = new Owners ({
				name: this.name
			});

			// Redirect after save
			owner.$save(function(response) {
				$location.path('owners');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// Clear form fields
			this.name = '';
		};

		// Remove existing Owner
		$scope.remove = function( owner ) {
			if ( owner ) {
				owner.$remove();

				for (var i in $scope.owners ) {
					if ($scope.owners [i] === owner ) {
						$scope.owners.splice(i, 1);
					}
				}
				$location.path('owners');
			} else {
				$scope.owner.$remove(function() {
					$location.path('owners');
				});
			}
		};


		// Update existing Owner
		$scope.update = function() {
			//if($scope.oldUser!=$scope.owner.myUser){
			//	//de-associate the old user
			//	$scope.deassociateUser;
			//	var user;
			//	for(var x=0;x<$scope.allUsers.length;x++){
			//		if($scope.allUsers[x]._id==$scope.oldUser){
			//			$scope.deassociateUser=$scope.allUsers[x];
			//			$scope.deassociateUser.ownerId=null;
			//			$http.put('/users',$scope.deassociateUser).
			//				success(function(data, status){
			//					console.log('deassociated user');
			//					console.log(data);
			//				});
			//			break;
			//		}
			//	}
			//}
			var owner = $scope.owner, req={};

			//req.user=$scope.associateUser;
			//$http.put('/users/ownerUpdate',req).
			//	success(function(data, status){
			//		console.log('associate user');
			//		console.log(data);
			//	}). then(function(){
            //
			//	});

			$http.put('/owners/'+owner._id,owner).
				success(function(data, status){
					console.log('owner data');
					console.log(data);
				}).then(function(){
					$location.path('/roster');
				});




		};

		// Find a list of Owners
		$scope.find = function() {
			$scope.owners = Owners.query();
		};

		$scope.getUsers=function(){
			$http.get('/allUsers').
				success(function(data, status){
					$scope.allUsers=data;
				});
		};

		$scope.initializeEditOwner=function(){
			$scope.findOne();
			$scope.find();
			$scope.getUsers();
		};

		// Find existing Owner
		$scope.findOne = function() {
			var ownerId=$stateParams.ownerId;
			$http.get('/owners/' + ownerId).
				success(function(data, status){
					$scope.owner=data;
				}).then(function(){
					$scope.associateUser={};
					$scope.associateUser._id=$scope.owner.myUser;
					$scope.oldUser=$scope.owner.myUser;
				});
		};


        $scope.changeKeeper=function(player,status){
            //check that the user owns the person first

			var req={};
			req.status=status;
			req.ownerId=$scope.owner._id;
			req.playerId=player._id;
			//check which action you need to do 1=keep -1=un-keep
			if(status==1){
				//keep
				//check salary - if the salary is over - give them an alert
				$http.put('/changeKeeper',req).
				success(function(data, status){
					$scope.owner=data;
				}).then(function(){
					console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length);
                    $scope.$digest();
				});
			}else{
				//just send
				$http.put('/changeKeeper',req).
				success(function(data, status){
					console.log('removed ' + player.name);
					$scope.owner=data;
					console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length);
					$scope.$digest();
				});
			}

        };

		$scope.changeOwnerUser=function(){
			$scope.owner.myUser=$scope.associateUser._id;
			$scope.associateUser.ownerId=$scope.owner._id;
		};
	}
]);