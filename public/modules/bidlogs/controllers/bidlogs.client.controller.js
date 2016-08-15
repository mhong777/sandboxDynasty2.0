'use strict';

// Bidlogs controller
angular.module('bidlogs').controller('BidlogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Bidlogs', 'Players', 'Hists', '$http', 'socket',
	function($scope, $stateParams, $location, Authentication, Bidlogs, Players, Hists, $http, socket) {
		$scope.authentication = Authentication;

		//QB, RB, WR, TE
		$scope.thresholds=[[5,10,20,2],[5,10,20,2],[5,10,20,3],[5,10,20,1]];
		$scope.bidAmountThreshold=1;
		$scope.bidThreshold=1;
		$scope.amounts=[[[],[],[],[]],[[],[],[],[]],[[],[],[],[]],[[],[],[],[]]];
		$scope.avgs=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];


		// Create new Bidlog
		$scope.create = function(){
			// Create new Bidlog object
			var bidlog = new Bidlogs ({
				name: this.name
			});

			// Redirect after save
			bidlog.$save(function(response) {
				$location.path('bidlogs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Bidlog
		$scope.remove = function(bidlog) {
			if ( bidlog ) { 
				bidlog.$remove();

				for (var i in $scope.bidlogs) {
					if ($scope.bidlogs [i] === bidlog) {
						$scope.bidlogs.splice(i, 1);
					}
				}
			} else {
				$scope.bidlog.$remove(function() {
					$location.path('bidlogs');
				});
			}
		};

		// Update existing Bidlog
		$scope.update = function() {
			var bidlog = $scope.bidlog;

			bidlog.$update(function() {
				$location.path('bidlogs/' + bidlog._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Bidlogs
		$scope.find = function() {
			$scope.bidlogs = Bidlogs.query();
		};

		// Find existing Bidlog
		$scope.findOne = function() {
			$scope.bidlog = Bidlogs.get({ 
				bidlogId: $stateParams.bidlogId
			});
		};


		//for analytic view
		$scope.initialize = function(){
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
						$http.get('/bidlogs').
						success(function(data, status){
							$scope.bidlogs=data;
						}).then(function(){
							$http.get('/hists').
							success(function(data, status){
								$scope.hists=data;
							}).then(function(){
								$scope.fillData();
							})
						});
					});
				});
			});
		};

		//table
		$scope.fillData=function(){
			var x,
				y,
				pos,
				i,
				rnk,
				zArray=[0,0,0,0],
				sum;
			for(x=0;x<$scope.owners.length;x++){
				//qb, rb, wr, te
				//initialize the arrays
				$scope.owners[x].positions=new Array(4);
				$scope.owners[x].bids=new Array(4);
				$scope.owners[x].cost=new Array(4);
				$scope.owners[x].won=new Array(4);
				$scope.owners[x].spent=new Array(4);
				$scope.owners[x].salary=0;
				$scope.owners[x].numPlayers=$scope.owners[x].keepRoster.length;
				$scope.owners[x].show=true;
				for(i=0;i<4;i++){
					$scope.owners[x].positions[i]=zArray.slice(0);
					$scope.owners[x].bids[i]=zArray.slice(0);
					$scope.owners[x].cost[i]=zArray.slice(0);
					$scope.owners[x].won[i]=zArray.slice(0);
					$scope.owners[x].spent[i]=zArray.slice(0);
				}
				for(y=0;y<$scope.owners[x].keepRoster.length;y++){
					if($scope.owners[x].keepRoster[y].position=='QB'){
						pos=0;
					}
					else if($scope.owners[x].keepRoster[y].position=='RB'){
						pos=1;
					}
					else if($scope.owners[x].keepRoster[y].position=='WR'){
						pos=2;
					}
					else if($scope.owners[x].keepRoster[y].position=='TE'){
						pos=3;
					}

					if($scope.owners[x].keepRoster[y].posRank<=$scope.thresholds[pos][0]){
						rnk=0;
					}
					else if($scope.owners[x].keepRoster[y].posRank<=$scope.thresholds[pos][1]){
						rnk=1;
					}
					else if($scope.owners[x].keepRoster[y].posRank<=$scope.thresholds[pos][2]){
						rnk=2;
					}
					else{
						rnk=3;
					}
					$scope.owners[x].positions[pos][rnk]++;
					$scope.owners[x].cost[pos][rnk]=($scope.owners[x].keepRoster[y].price*10 + $scope.owners[x].cost[pos][rnk]*10)/10;
					$scope.owners[x].salary=($scope.owners[x].salary*10 + $scope.owners[x].keepRoster[y].price*10)/10;
				}
			}

			for(x=0;x<$scope.bidlogs.length;x++){
				for(y=0;y<$scope.owners.length;y++){
					if($scope.owners[y]._id==$scope.bidlogs[x].owner._id && $scope.bidlogs[x].price>=$scope.bidAmountThreshold){
						if($scope.bidlogs[x].player.position=='QB'){
							pos=0;
						}
						else if($scope.bidlogs[x].player.position=='RB'){
							pos=1;
						}
						else if($scope.bidlogs[x].player.position=='WR'){
							pos=2;
						}
						else if($scope.bidlogs[x].player.position=='TE'){
							pos=3;
						}

						if($scope.bidlogs[x].player.posRank<=$scope.thresholds[pos][0]){
							rnk=0;
						}
						else if($scope.bidlogs[x].player.posRank<=$scope.thresholds[pos][1]){
							rnk=1;
						}
						else if($scope.bidlogs[x].player.posRank<=$scope.thresholds[pos][2]){
							rnk=2;
						}
						else{
							rnk=3;
						}

						$scope.owners[y].bids[pos][rnk]++;
						break;
					}
				}
			}

			for(x=0;x<$scope.hists.length;x++){
				if($scope.hists[x].price>0){
					if($scope.hists[x].playerdat.position=='QB'){
						pos=0;
					}
					else if($scope.hists[x].playerdat.position=='RB'){
						pos=1;
					}
					else if($scope.hists[x].playerdat.position=='WR'){
						pos=2;
					}
					else if($scope.hists[x].playerdat.position=='TE'){
						pos=3;
					}

					if($scope.hists[x].playerdat.posRank<=$scope.thresholds[pos][0]){
						rnk=0;
					}
					else if($scope.hists[x].playerdat.posRank<=$scope.thresholds[pos][1]){
						rnk=1;
					}
					else if($scope.hists[x].playerdat.posRank<=$scope.thresholds[pos][2]){
						rnk=2;
					}
					else{
						rnk=3;
					}

					//for avgs
					$scope.amounts[pos][rnk].push($scope.hists[x].price);

					//associate owner
					for(y=0;y<$scope.owners.length;y++){
						if($scope.owners[y].name==$scope.hists[x].owner){
							$scope.owners[y].won[pos][rnk]++;
							break;
						}
					}
				}
			}

			for(x=0;x<4;x++){
				for(y=0;y<4;y++){
					sum=0;
					for(i=0;i<$scope.amounts[x][y].length;i++){
						sum=($scope.amounts[x][y][i]*10 + sum*10)/10;
					}
					if($scope.amounts[x][y].length>0){
						$scope.avgs[x][y]=Math.round(sum/$scope.amounts[x][y].length*10)/10;
					}
				}
			}

			$scope.$digest;

		};

		socket.on('updateAdmin', function(){
			$scope.initialize();
		});

	}
]);