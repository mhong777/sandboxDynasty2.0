'use strict';

angular.module('owners').controller('ReviewRosterController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, $http ) {

		//INITIALIZE FUNCTION
		// Find a list of Owners
		$scope.getOwners = function() {
			var x= 0,
				salary;

			$http.get('/gvars').
				success(function(data, status){
					$scope.gvar=data[0];
				}).then(function(){
					$http.get('/reviewRoster').
						success(function(data, status){
							$scope.owners=data;
							console.log($scope.owners);
						}).then(function(){
							for(x=0;x<$scope.owners.length;x++){
								salary=0;
								salary=$scope.getSalary($scope.owners[x]);
								$scope.owners[x].salary=salary;
							}
						});
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

			var salary= 0,
				x;
			for(x=0;x<owner.keepRoster.length;x++){
				//console.log(salary);
				//console.log(typeof owner.keepRoster[x].price);
				salary= ((salary*10) + (owner.keepRoster[x].price*10))/10;
				//console.log(owner.keepRoster[x].price + ' ' + salary);
			}
			return salary;
			//return salary.toFixed(2);
		};

		/*************
		 *
		 *************/
		$scope.items=[
			{
				"name":"a2",
				"fValue1":[{"lookupId":1,"lookupValue":"a"}],
				"fValue2":[{"lookupId":1,"lookupValue":"2"}]
			},
			{
				"name":"b3",
				"fValue1":[{"lookupId":1,"lookupValue":"b"}],
				"fValue2":[{"lookupId":1,"lookupValue":"3"}]
			},
			{
				"name":"cb3",
				"fValue1":[{"lookupId":1,"lookupValue":"c"},{"lookupId":1,"lookupValue":"b"}],
				"fValue2":[{"lookupId":1,"lookupValue":"3"}]
			},
			{
				"name":"d1",
				"fValue1":[{"lookupId":1,"lookupValue":"d"}],
				"fValue2":[{"lookupId":1,"lookupValue":"1"}]
			},
			{
				"name":"c4",
				"fValue1":[{"lookupId":1,"lookupValue":"c"}],
				"fValue2":[{"lookupId":1,"lookupValue":"4"}]
			},
			{
				"name":"a3",
				"fValue1":[{"lookupId":1,"lookupValue":"a"}],
				"fValue2":[{"lookupId":1,"lookupValue":"3"}]
			}
		];
		/*******
		 *FOR FILTERS
		 *******/

		function userExists(arr,searchingFor) {
			return arr.some(function(el) {
				return el.lookupValue === searchingFor;
			});
		}

		$scope.changeAvailable=function(value){
			if(value===1){
				$scope.filters.available='';
				$scope.availableString='All Players';
				return;
			}
			else if(value ===2){
				$scope.filters.available=true;
				$scope.availableString='Free Agents';
				return;
			}
			else{
				$scope.filters.available=false;
				$scope.availableString='Currently Owned';
				return;
			}
		};

		//filter by position
		$scope.addFilter=function(position){
			$scope.filters.position.push(position);
		};

		$scope.listFilter = function (value1, value2) {
			return function (list) {
				if(userExists(list.fValue1,value1) || $scope.filters.value1==''){
					if(userExists(list.fValue2,value2) || $scope.filters.value2=='') {
						return list;
					}
				}
			};
		};

		//Filter for finding players
		$scope.filters={};
		$scope.filters.value1='';
		$scope.filters.value2='';



	}
]);