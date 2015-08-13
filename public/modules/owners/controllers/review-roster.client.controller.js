'use strict';

angular.module('owners').controller('ReviewRosterController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, $http ) {

		//INITIALIZE FUNCTION
		// Find a list of Owners
		$scope.getOwners = function() {
			var x= 0,
				salary;
			$http.get('/reviewRoster').
				success(function(data, status){
					$scope.owners=data;
				}).then(function(){
					for(x=0;x<$scope.owners.length;x++){
						salary=0;
						salary=$scope.getSalary($scope.owners[x]);
						$scope.owners[x].salary=salary;
					}
				});
		};

		$scope.initialize = function(){
			if(Authentication.user==null){
				$location.path('/');
			}
			else{
				$scope.getOwners();
				$scope.salaryCap=300;
				$scope.keeperCap=175;
			}
		};

		$scope.goToRoster = function(ownerId){
			$location.path('edit-roster/' + ownerId);
		};



		$scope.getSalary = function(owner){
			var x= 0,
				salary=0;

			for(x=0;x<owner.keepRoster.length;x++){
				salary+=owner.keepRoster[x].price;
			}

			return salary.toFixed(2);
		};


	}
]);