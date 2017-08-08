'use strict';

angular.module('bids').controller('RfaController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', '$http', 'Bids', 'socket', 'Players', '$timeout', 'Hists',
	function($scope, $stateParams, $location, Authentication, Owners, $http, Bids, socket,Players, $timeout, Hists) {

		//INITIALIZE FUNCTION
		// Find a list of Owners
		$scope.getOwners = function() {
			var x= 0,
				salary=0;
			//ownersAndPlayers

		};
		$scope.onlyNumbers = function(bidAmt){
			if(bidAmt % 1 == 0 && bidAmt>0){
				return false;
			}
			else{
				return true;
			}

		};

		//need a function to get all of the bids too
		//available salary = totalCap - (keeperSalary + outstandingBids)
		//outstandingBids = loop through current bids to see which ones you own

		//need to get your own info to look at your roster and such

		$scope.initialize = function(){
			if(!Authentication){
				console.log('need to log in first');
				$location.path('/signin');
			}
			else{
				$scope.salary=0;
				$scope.numPlayers;

				//should be in gvars
				//$scope.salaryCap=300;
				//$scope.maxPlayers=22;

				//for hiding everything
				//$scope.bidShow=true;
				//$scope.matchShow=true;
				//$scope.timerShow=true;
				//$scope.draftShow=true;

				//for counter
				//$scope.counter=100;
				$scope.mins ='';
				$scope.secs ='';
				//$scope.countdown();

				//Filter for finding players
				$scope.sortType='absRank';
				$scope.sortReverse=false;
				$scope.searchPlayer='';
				$scope.filters={};
				$scope.filters.position='';
				$scope.availableString='All Players';
				$scope.filters.available=true;
				$scope.availableString='';
				$scope.filters.rookie='';

				$scope.user=Authentication.user;
				try{
					$scope.user._id
				}catch(e){
					$location.path('/signin');
				}
				if($scope.user._id==null){
					$location.path('/signin');
				}

				$http.get('/gvars').
					success(function(data, status){
						$scope.gvar=data[0];
					}).then(function(){
						if($scope.gvar.rookieDraft){
							$scope.filters.rookie=true;
						}
						$http.get('/bids').
							success(function(data, status){
								$scope.bids=data;
							}).then(function(){
								$http.get('/ownersAndPlayers').
									success(function(data, status){
										$scope.owners=data;
									}).then(function(){
										$scope.setMetrics();
									});
							}).then(function(){
								$scope.players = Players.query();
							}).then(function(){
								$scope.hists = Hists.query();
								//$scope.numHists=$scope.hists.get('length');
								//console.log($scope.hists);
								//console.log($scope.hists.$promise);
							});
					});
			}
		};

		$scope.setMetrics=function(){
			console.log('setting metrics');
			var x,
				salary= 0,
				fxnOut,
				numPlayer;

			for(x=0;x<$scope.owners.length;x++){
				salary=0;
				fxnOut=$scope.getSalary($scope.owners[x]);
				salary=fxnOut[0];
				numPlayer=fxnOut[1];
				$scope.owners[x].salary=salary;
				$scope.owners[x].numPlayer=numPlayer;
				if($scope.owners[x].myUser==$scope.user._id){
					$scope.salary=salary;
					$scope.numPlayers=numPlayer;
					$scope.myOwner=$scope.owners[x];
					if(!$scope.dispOwner){
                        $scope.dispOwner=$scope.owners[x];
					}
				}
			}
			console.log($scope.gvar.salaryCap - $scope.myOwner.salary);
		};

		$scope.getSalary = function(owner){
			var x= 0,
				salary= 0,
				bid,
				numPlayer=0;
			for(x=0;x<owner.keepRoster.length;x++){
				salary=(salary*10 + owner.keepRoster[x].price*10)/10;
				numPlayer++
			}
			if($scope.gvar.rfaDraft){
				for(x=0;x<$scope.bids.length;x++){
					bid=$scope.bids[x];
					if(bid.owner._id==owner._id){
						salary+=bid.price;
						numPlayer++
					}
				}
			}
			return [Math.ceil(salary),numPlayer];
			//return [salary,numPlayer];
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
		$scope.oneUp=function(bid,price){
            var input={};
            input.bid=angular.copy(bid);
            input.bid.myBid=price;
            input.owner=$scope.myOwner._id;
            socket.emit('increaseBid', input);
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
				numPlayers++;
				if(salary<=($scope.gvar.salaryCap + $scope.myOwner.extraMoney) && numPlayers<=$scope.gvar.maxPlayers){
					//send to socket - then update
					var input={};
					input.bid=bid;
					input.owner=$scope.myOwner._id;
					socket.emit('increaseBid', input);
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
			$scope.draft(bid.player._id, bid.price, bid._id);
		};

		$scope.draftRookie=function(rookie, playerId, price, bidId){
			if(rookie){
				$scope.draft(playerId, price, bidId);
			}
		};


		//draft
		$scope.draft=function(playerId, price, bidId){
			var input={};
			input.playerId=playerId;
			input.ownerId=$scope.myOwner._id;
			input.price=price;
			input.bidId=bidId;
			socket.emit('draft', input);
		};

		$scope.nominate=function(playerId, playerName){
			var input={};
			input.price=1;
			input.player=playerId;
			input.owner=$scope.myOwner._id;
			input.user=$scope.user._id;
			input.origOwner=null;
			input.name='bid for ' + playerName;
			socket.emit('nominate', input);
			//console.log(input);
		};

		//other
		socket.on('updatePlayers', function(input){
			$scope.players=input;
			$scope.$digest();
			//console.log('update player');
		});

		socket.on('updateOwners', function(input){
			$scope.owners=input;
			$scope.setMetrics();
			$scope.$digest();
			//console.log('update owner');
		});

		socket.on('updateBids', function(input){
			$scope.bids=input;
			$scope.$digest();
			//console.log('update bids');
		});

		socket.on('updateHistory', function(input){
			$scope.hists=input;
			$scope.$digest();
		});

		socket.on('updateRfa', function(input){
			var x,salary, fxnOut,numPlayer;

			//update the bid
			$scope.bids=input;
			$scope.setMetrics();
	        //console.log(input);
			$scope.$digest();
		});

		socket.on('updateGvar', function(input){
			$scope.gvar=input;
			if($scope.gvar.rookieDraft){
				$scope.filters.rookie=true;
			}
			else{
				$scope.filters.rookie='';
			}
			$scope.$digest();
		});

		socket.on('timer', function(input){
			//console.log(input.countdown);
			$scope.time=input.countdown;
			$scope.mins = parseInt(input.countdown / 60);
			$scope.secs = parseInt(input.countdown % 60);
			if($scope.secs<10){
				$scope.secs='0' + $scope.secs;
			}
			//console.log($scope.secs);
			//console.log(typeof $scope.secs);
			//console.log($scope.mins);
			//console.log(typeof $scope.mins)
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