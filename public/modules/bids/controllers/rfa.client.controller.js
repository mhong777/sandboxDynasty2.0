'use strict';

angular.module('bids').controller('RfaController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', 'Bids', 'socket', 'Players', '$timeout',
	function($scope, $stateParams, $location, Authentication, Owners, $http, Bids, socket,Players, $timeout ) {

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
			else{
				var x,
					salary= 0,
					fxnOut,
					numPlayer;

				$scope.salary=0;
				$scope.numPlayers;
				$scope.onlyNumbers = /^\d+$/;

				//should be in gvars
				//$scope.salaryCap=300;
				//$scope.maxPlayers=22;

				//for hiding everything
				//$scope.bidShow=true;
				//$scope.matchShow=true;
				$scope.timerShow=true;
				//$scope.draftShow=true;

				//for counter
				$scope.counter=100;
				$scope.mins = parseInt($scope.counter / 60);
				$scope.secs = parseInt($scope.counter % 60);
				//$scope.countdown();

				//Filter for finding players
				$scope.sortType='absRank';
				$scope.sortReverse=false;
				$scope.searchPlayer='';
				$scope.filters={};
				$scope.filters.position='';
				$scope.availableString='All Players';
				$scope.filters.available='';
				$scope.availableString='';
				$scope.filters.rookie='';

				$scope.ownerId=Authentication.user.ownerId;

				$http.get('/gvars').
					success(function(data, status){
						$scope.gvar=data[0];
					}).then(function(){
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
							}).then(function(){
								$scope.players = Players.query();
							});
					});



			}
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
			return [Math.ceil(salary),numPlayer];
		};

		/****
		 * FOR HTML COSMETICS
		 */
		$scope.viewOwner=function(owner){
			$scope.dispOwner=owner;
		};

		$scope.checkAmount=function(price){
			console.log(price + ' - ' + $scope.salary);
		};

		/*****
		 *MAIN FUNCTIONS
		 ****/
		//made function to check the bid - can be used for both rfa and auction
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
				if(salary<=($scope.gvar.salaryCap + $scope.myOwner.extraMoney) && numPlayers<=$scope.gvar.maxPlayers){
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

		$scope.matchBid=function(bid){
			console.log(bid);
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


		/*******
		 *FOR FILTERS
		 *******/
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

		$scope.listFilter = function (position, available, rookie) {
			return function (list) {
				if(list.available===available || available===''){
					if(list.rookie==rookie || rookie===''){
						return list.position.match(position);
					}
				}
			};
		};

		/*****
		 * FOR TIMER
		 ****/
		var stopped;


		$scope.countdown = function() {
			stopped = $timeout(function() {
				$scope.counter--;
				$scope.mins = parseInt($scope.counter / 60);
				$scope.secs = parseInt($scope.counter % 60);
				$scope.countdown();
			}, 1000);
		};

		//minutes = parseInt(seconds_left / 60);
		//seconds = parseInt(seconds_left % 60);

	}
]);