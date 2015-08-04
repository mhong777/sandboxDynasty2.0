'use strict';

angular.module('bids').controller('RfaController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', 'Bids', 'socket',
	function($scope, $stateParams, $location, Authentication, Owners, $http, Bids, socket ) {

		//INITIALIZE FUNCTION
		// Find a list of Owners
		$scope.getOwners = function() {
			var x= 0,
				salary=0;
			//ownersAndPlayers

		};

		//need a function to get all of the bids too
		//available salary = totalCap - (keeperSalary + outstandingBids)
		//outstandingBids = loop through current bids to see which ones you own

		//need to get your own info to look at your roster and such

		$scope.initialize = function(){
			if(!Authentication){
				console.log('need to log in first');
			}

			var x,
				salary= 0,
				fxnOut,
				numPlayer;

			$scope.salaryCap=300;
			$scope.salary=0;
			$scope.numPlayers;
			$scope.maxPlayers=22;

			$scope.ownerId=Authentication.user.ownerId;


			$http.get('/bids').
				success(function(data, status){
					$scope.bids=data;
				}).then(function(){
					$http.get('/ownersAndPlayers').
						success(function(data, status){
							$scope.owners=data;
						}).then(function(){
							for(x=0;x<$scope.owners.length;x++){
								salary=0;
								fxnOut=$scope.getSalary($scope.owners[x]);
								salary=fxnOut[0];
								numPlayer=fxnOut[1];
								$scope.owners[x].salary=salary;
								$scope.owners[x].numPlayer=numPlayer;
								if($scope.owners[x]._id==$scope.ownerId){
									$scope.salary=salary;
									$scope.numPlayers=numPlayer;
									$scope.myOwner=$scope.owners[x];
									$scope.dispOwner=$scope.owners[x];
								}
							}
						});
				});
		};

		$scope.getSalary = function(owner){
			var x= 0,
				salary= 0,
				bid,
				numPlayer=0;
			for(x=0;x<owner.keepRoster.length;x++){
				salary+=owner.keepRoster[x].price;
				numPlayer++
			}
			for(x=0;x<$scope.bids.length;x++){
				bid=$scope.bids[x];
				if(bid.owner._id==owner._id){
					salary+=bid.price;
					numPlayer++
				}
			}
			return [salary.toFixed(2),numPlayer];
		};

		$scope.viewOwner=function(owner){
			$scope.dispOwner=owner;
		};

		$scope.submitBid=function(bid){
			var bidTest= 0,
				x,
				salary=$scope.myOwner.salary,
				numPlayers=$scope.myOwner.numPlayer;

			//function to validate and put in bid
			if(bid.myBid>bid.price){
				//check to see if the salary is under the cap
				// - need to check if the bid is the same as another
				for(x=0;x<$scope.bids.length;x++){
					if($scope.bids[x]._id==bid._id){
						if($scope.bids[x].owner._id==$scope.ownerId){
							salary=salary-$scope.bids[x].price;
							numPlayers--
						}
						break
					}
				}

				salary=salary + bid.myBid;
				numPlayers++
				if(salary<=$scope.salaryCap && numPlayers<=$scope.maxPlayers){
					//send to socket - then update
					var input={};
					input.bid=bid;
					input.owner=$scope.ownerId;
					socket.emit('modRfaBid', input);
				}
				else{
					console.log('cant do that bcz you are either over salary cap or max players');
				}
			}
			else{
				console.log('cant do that bcz you have to bid more than current price');
			}
		};


		socket.on('updateRfa', function(input){
			var x,salary, fxnOut,numPlayer;

			//update the bid
			$scope.bids=input;
	        //console.log(input);
			for(x=0;x<$scope.owners.length;x++){
				salary=0;
				fxnOut=$scope.getSalary($scope.owners[x]);
				salary=fxnOut[0];
				numPlayer=fxnOut[1];
				$scope.owners[x].salary=salary;
				$scope.owners[x].numPlayer=numPlayer;
				if($scope.owners[x]._id==$scope.ownerId){
					$scope.salary=salary;
					$scope.numPlayers=numPlayer;
					$scope.myOwner=$scope.owners[x];
				}
			}
			$scope.$digest();
		});



	}
]);