'use strict';

angular.module('owners').controller('EditRosterController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', '$modal',
	function($scope, $stateParams, $location, Authentication, Owners, $http, $modal ) {
		$scope.user = Authentication.user;
		//$scope.keeperCap=175;
		//$scope.totalCap=parseInt(300);
		//$scope.changeTime=1;
		$scope.timeCheck=false;
		$scope.rosterCheck=false;


		$scope.getOwner=function(){
			//console.log(Authentication.user);
			if(Authentication.user==null){
				$location.path('/');
			}
			else{
				var ownerId=$stateParams.ownerId,
					x;

				$scope.salary=0;
				$scope.rfaSalary=0;
				$http.get('/gvars').
					success(function(data, status){
						$scope.gvar=data[0];
						$scope.changeTime=$scope.gvar.editTime;
					}).then(function(){
						$http.get('/editRoster/' + ownerId).
							success(function(data, status){
								$scope.owner=data;
							}).then(function(){
								if($scope.owner.myUser==$scope.user._id){
									$scope.rosterCheck=true;
								}
								$scope.setData();
							});
					});
			}
		};

		//make these server functions - not client functions

		$scope.changeKeeper=function(player,status){
			//check that the user owns the person first
			if($scope.rosterCheck && $scope.changeTime){
				var req={};
				req.status=status;
				req.ownerId=$scope.owner._id;
				req.playerId=player._id;
				//check which action you need to do 1=keep -1=un-keep
				if(status==1){
					//keep
					//check salary - if the salary is over - give them an alert
					if(($scope.salary+player.price)<=$scope.gvar.keeperCap && ($scope.rfaSalary+player.price)<=$scope.gvar.salaryCap){
						//rest - send status, ownerId, playerId
						//console.log(req);
						$http.put('/changeKeeper',req).
							success(function(data, status){
								console.log('added ' + player.name);
								$scope.owner=data;
							}).then(function(){
								console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length);
								$scope.setData();
							});
					}else{
						alert('sorry bud, you\'re over the limit');
					}
				}else{
					//just send
					$http.put('/changeKeeper',req).
						success(function(data, status){
							console.log('removed ' + player.name);
							$scope.owner=data;
						console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length);
						}).then(function(){
							$scope.setData();
						});
				}
			}
		};

		$scope.changeBidee=function(player,status){
			//console.log(($scope.rfaSalary+player.price + $scope.salary));
			//console.log($scope.totalCap + $scope.owner.extraMoney);
			//check that the user owns the person first
			if($scope.rosterCheck && $scope.changeTime){
				var req={};
				req.status=status;
				req.ownerId=$scope.owner._id;
				req.playerId=player._id;
				//check which action you need to do 1=keep -1=un-keep
				if(status==1){
					//keep
					//check salary - if the salary is over - give them an alert
					if(($scope.rfaSalary+player.price+$scope.salary)<=($scope.gvar.salaryCap + $scope.owner.extraMoney)){
						//rest - send status, ownerId, playerId
						console.log(req);
						$http.put('/changeBidee',req).
							success(function(data, status){
								console.log('changed bidee');
								console.log(data);
								$scope.owner=data;
							}).then(function(){
								$scope.setData();
							});
					}else{
						alert('sorry bud, you don\'t have enough cash to pay for that');
					}
				}else{
					//just send
					console.log(req);
					$http.put('/changeBidee',req).
						success(function(data, status){
							console.log(data);
							$scope.owner=data;
						}).then(function(){
							console.log('removed bidee');
							$scope.setData();
						});
				}
			}
		};

		$scope.setData=function(){
			console.log('setting data');
			var x,
				salary= 0,
				rfaSalary=0;
			$scope.owner.keepEligable=[];
			$scope.owner.bidEligable=[];
			for(x=0;x<$scope.owner.previousRoster.length;x++){
				if($scope.owner.previousRoster[x].yearsOwned<3){
					$scope.owner.keepEligable.push($scope.owner.previousRoster[x]);
				}
				else{
					$scope.owner.bidEligable.push($scope.owner.previousRoster[x]);
				}
			}
			for(x=0;x<$scope.owner.keepRoster.length;x++){
				salary+=$scope.owner.keepRoster[x].price;
			}

			rfaSalary+=$scope.owner.bidRoster.length;

			$scope.salary=Math.ceil(salary);
			//parseFloat(Math.round(salary*100)/100);
			$scope.rfaSalary=Math.ceil(rfaSalary);


			if($scope.rosterCheck){
				$scope.errMsg=false;
			}else{
				$scope.errMsg=true;
			}

			$scope.$digest;
		};

		//MODAL
		$scope.open = function (myMode) {

			if(myMode==1){
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'modules/owners/views/keeper-modal.client.view.html',
					controller: 'ModalController',
					size: 'lg'
				});
			}
			else{
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'modules/owners/views/rfa-modal.client.view.html',
					controller: 'ModalController',
					size: 'lg'
				});
			}
		};



	}
]);