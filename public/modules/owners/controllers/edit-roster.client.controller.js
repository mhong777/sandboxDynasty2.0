'use strict';

angular.module('owners').controller('EditRosterController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', '$modal',
	function($scope, $stateParams, $location, Authentication, Owners, $http, $modal ) {
		$scope.user = Authentication.user;
		$scope.keeperCap=175;
		$scope.totalCap=300;
		$scope.changeTime=1;
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
				$http.get('/editRoster/' + ownerId).
					success(function(data, status){
						$scope.owner=data;
					}).then(function(){
						if($scope.user.ownerId!=$scope.owner._id){
							$scope.rosterCheck=true;
						}
						$scope.setData();
					});
			}
		};

		$scope.changeKeeper=function(player,status){
			//check that the user owns the person first
			if($scope.user.ownerId==$scope.owner._id && $scope.changeTime==1){
				var req={};
				req.status=status;
				req.ownerId=$scope.owner._id;
				req.playerId=player._id;
				//check which action you need to do 1=keep -1=un-keep
				if(status==1){
					//keep
					//check salary - if the salary is over - give them an alert
					if(($scope.salary+player.price)<=$scope.keeperCap && ($scope.rfaSalary+player.price)<=$scope.totalCap){
						//rest - send status, ownerId, playerId
						//console.log(req);
						$http.put('/changeKeeper',req).
							success(function(data, status){
								console.log('player added');
								console.log(data);
								$scope.owner=data;
							}).then(function(){
								$scope.setData();
							});
					}else{
						alert('sorry bud, you\'re over the limit');
					}
				}else{
					//just send
					console.log(req);
					$http.put('/changeKeeper',req).
						success(function(data, status){
							console.log('player removed');
							console.log(data);
							$scope.owner=data;
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
			if($scope.user.ownerId==$scope.owner._id && $scope.changeTime==1){
				var req={};
				req.status=status;
				req.ownerId=$scope.owner._id;
				req.playerId=player._id;
				//check which action you need to do 1=keep -1=un-keep
				if(status==1){
					//keep
					//check salary - if the salary is over - give them an alert
					if(($scope.rfaSalary+player.price+$scope.salary)<=($scope.totalCap + $scope.owner.extraMoney)){
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
				//console.log($scope.owner.keepRoster[x].price);
				salary+=$scope.owner.keepRoster[x].price;
			}

			for(x=0;x<$scope.owner.bidRoster.length;x++){
				rfaSalary+=$scope.owner.bidRoster[x].price;
			}
			$scope.salary=Math.round(salary*100)/100;
			$scope.rfaSalary=Math.round(rfaSalary*100)/100;


			if($scope.owner._id==$scope.user.ownerId){
				$scope.errMsg=false;
			}else{
				$scope.errMsg=true;
			}
		};

		//MODAL
		$scope.open = function () {

			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'modules/owners/views/keeper-modal.client.view.html',
				controller: 'ModalController',
				size: 'lg'
			});
		};



	}
]);