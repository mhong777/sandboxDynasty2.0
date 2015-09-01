'use strict';

// Players controller
angular.module('players').controller('PlayersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Players', 'Owners', '$http', 'socket',
	function($scope, $stateParams, $location, Authentication, Players, Owners, $http, socket) {
		$scope.authentication = Authentication;

		//###ADD IN ALL OF THE TEAMS
		$scope.teams=[{name:'ARI', byeWeek:9}, {name:'ATL', byeWeek:10}, {name:'BAL', byeWeek:9}, {name:'BUF', byeWeek:8}, {name:'CAR', byeWeek:5}, {name:'CHI', byeWeek:7}, {name:'CIN', byeWeek:7}, {name:'CLE', byeWeek:11}, {name:'DAL', byeWeek:6}, {name:'DEN', byeWeek:7}, {name:'DET', byeWeek:9}, {name:'GB', byeWeek:7}, {name:'HOU', byeWeek:9}, {name:'IND', byeWeek:10}, {name:'JAC', byeWeek:8}, {name:'KC', byeWeek:9}, {name:'MIA', byeWeek:5}, {name:'MIN', byeWeek:5}, {name:'NE', byeWeek:4}, {name:'NO', byeWeek:11}, {name:'NYG', byeWeek:11}, {name:'NYJ', byeWeek:5}, {name:'OAK', byeWeek:6}, {name:'PHI', byeWeek:8}, {name:'PIT', byeWeek:11}, {name:'SD', byeWeek:10}, {name:'SEA', byeWeek:9}, {name:'SF', byeWeek:10}, {name:'STL', byeWeek:6}, {name:'TB', byeWeek:6}, {name:'TEN', byeWeek:4}, {name:'WAS', byeWeek:8}, {name:'FA', byeWeek:0}];
		$scope.contractYears=[0,1,2,3];
		$scope.playerPositions=['QB','RB','WR','TE','K','D'];

		$scope.initializePlayer=function(){
			$scope.player={};
			$scope.player.player="";
			$scope.player.absRank=500;
			$scope.player.posRank=500;
			$scope.player.price=0;
			$scope.player.rookie=false;
			$scope.player.yearsOwned=$scope.contractYears[0];
		};

		$scope.initializeEditPlayer=function(){
			$scope.myOwner={};

			var playerId=$stateParams.playerId;
			$http.get('/players/' + playerId).
				success(function(data, status){
					$scope.player=data;
				}).then(function(){
					//get owners
					var nullOwner={};
					nullOwner.name='none';
					nullOwner._id=null;
					$scope.content='';
					$scope.playerArray=[];
					$http.get('/owners').
						success(function(data, status){
							$scope.owners=data;
							console.log($scope.owners);
						}).then(function(){
							//associate myOwner and add the null owner
							$scope.owners.push(nullOwner);
							if($scope.player.owner){
								for(var x=0;x<$scope.owners.length;x++){
									if($scope.player.owner==$scope.owners[x]._id){
										$scope.myOwner=$scope.owners[x];
									}
								}
								$scope.oldOwner=$scope.player.owner;
							}
							else{
								$scope.oldOwner=null;
							}
						}).then(function(){
							$scope.findOne();
						});
				});
		};

		$scope.initializeBatchUpload=function(){
			var nullOwner={};
			nullOwner.name='none';
			nullOwner._id=null;
			$scope.content='';
			$scope.playerArray=[];

			$http.get('/owners').
				success(function(data, status){
					$scope.owners=data;
					console.log($scope.owners);
				}).then(function(){
					$scope.owners.push(nullOwner);
				});
		};

		$scope.showContent = function($fileContent){
			$scope.content = $fileContent;
			console.log($scope.content);
		};

		$scope.parseCSV=function(){
			if($scope.content==''){
				console.log('input something first');
			}
			else{
				$scope.CSVToArray($scope.content);
			}
		};

		$scope.CSVToArray=function(strData){
			var rows=strData.split('\n'),
				player={},
				cols, i, j,
				oName,
				teamIn;

			//skip the first row because it has headers
			for(i=1;i<rows.length;i++){
				oName='';
				cols=rows[i].split(',');
				//console.log(rows[i]);

				player={};
				player.team={};
				player.name=cols[0];
				player.position=cols[1];
				//player.team.byeWeek=Number(cols[3]);
				player.absRank=Number(cols[4]);
				player.posRank=Number(cols[5]);
				player.uploaded=false;
				player.toUpload=true;
				if(cols[6]=="TRUE"){
					player.rookie=true;
				}
				else{
					player.rookie=false;
				}
				player.price=Number(cols[7]);
				player.yearsOwned=Number(cols[8]);
				//player.owner=cols[9];
				player.owner={};
				oName=cols[9];
				oName=oName.trim();
				if(oName != ''){
					console.log(oName);
					for(j=0;j<$scope.owners.length;j++){
						if($scope.owners[j].name==oName){
							player.owner=$scope.owners[j];
						}
					}
				}
				else{
					player.owner=null;
				}

				//###DO THE SAME VALIDATION FOR THE TEAMS
				teamIn=cols[2];
				if(teamIn != ''){
					for(j=0;j<$scope.teams.length;j++){
						if($scope.teams[j].name==teamIn){
							player.team=$scope.teams[j];
						}
					}
				}

				$scope.playerArray.push(player);
			}
		};

		//upload player array
		$scope.batchAdd=function(){
			var i,
				uploadPlayer,
				newPlayer,
				j,
				req={};
			for(i=0;i<$scope.playerArray.length;i++){
				uploadPlayer=$scope.playerArray[i];
				if(uploadPlayer.owner != null){
					uploadPlayer.available=false;
				}
				if(uploadPlayer.toUpload){
					// Create new Player object
					newPlayer = new Players ({
						name: uploadPlayer.name,
						position: uploadPlayer.position,
						team: uploadPlayer.team,
						absRank: uploadPlayer.absRank,
						posRank: uploadPlayer.posRank,
						rookie: uploadPlayer.rookie,
						price: uploadPlayer.price,
						yearsOwned: uploadPlayer.yearsOwned,
						available: uploadPlayer.available
					});
					if(uploadPlayer.owner!=null){
						newPlayer.owner=uploadPlayer.owner._id;
					}
					//Add it to the DB
					newPlayer.$save(function(response) {
						//if a success log that it was a success and change the states of the player's properties
						//only update an owner if there is an owner to update
						console.log(response);
						if(response.owner!=null && response.owner!=''){
							req={};
							req.ownerId=response.owner;
							req.playerId=response._id;
							//console.log(req);

							$http.put('/batchAddPlayer',req).
								success(function(data, status){
									console.log(data);
									for(j=0;j<$scope.playerArray.length;j++){
										if($scope.playerArray[j].name==response.name){
											console.log($scope.playerArray[j]);
											$scope.playerArray[j].uploaded=true;
											$scope.playerArray[j].toUpload=false;
										}
									}
								});
						}
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
						console.log($scope.error);
						console.log(newPlayer.name + ' - fail');
					});
					//console.log(newPlayer);
				}
			}
		};

		// Create new Player
		$scope.create = function() {
			//make it so you have to put in a position
			if($scope.player.position===undefined || $scope.player.name===undefined){
				alert('cmon man...don\'t be lazy');
			}
			else{
				// Create new Player object
				var newPlayer = new Players ({
					name: $scope.player.name,
					position: $scope.player.position,
					team: $scope.player.team,
					absRank: $scope.player.absRank,
					posRank: $scope.player.posRank,
					rookie: $scope.player.rookie,
					price: $scope.player.price,
					yearsOwned: $scope.player.yearsOwned
				});

				console.log(newPlayer);

				// Redirect after save
				newPlayer.$save(function(response) {
					socket.emit('updatePlayers');
					$location.path('players/' + response._id + '/edit');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		// Remove existing Player
		$scope.remove = function() {
			var ownerReq={};
			ownerReq.ownerId=$scope.oldOwner;
			ownerReq.playerId=$scope.player._id;
			ownerReq.oldMarker=true;
			console.log('old change');
			console.log(ownerReq);
			$http.put('/ownerChange',ownerReq).
				success(function(data, status){
					console.log('changed the old one');
					console.log(data);
				}).then(function(){
					$scope.dPlayer.$remove();
					$location.path('players');
				});
		};

		// Update existing Player
		$scope.update = function() {
			var req={},
				updateOwner=false,
				ownerReq={};
			if($scope.myOwner){
				if($scope.myOwner._id!=$scope.oldOwner){
					$scope.player.owner=$scope.myOwner._id;
					updateOwner=true;
				}
			}
			console.log('request');
			console.log($scope.player);
			req.player=$scope.player;
			//update the owner
			$http.put('/players/' + $scope.player._id,req).
				success(function(data, status){
					console.log('changed');
					console.log(data);
				}).then(function(){
					//update the owners - old one first, then new one - check if it is null
					if(updateOwner){
						//do the old one first
						ownerReq.ownerId=$scope.oldOwner;
						ownerReq.playerId=$scope.player._id;
						ownerReq.oldMarker=true;
						console.log('old change');
						console.log(ownerReq);
						$http.put('/ownerChange',ownerReq).
							success(function(data, status){
								console.log('changed the old one');
								console.log(data);
							}).then(function(){
								//do the new one
								ownerReq.ownerId=$scope.player.owner;
								ownerReq.oldMarker=false;
								console.log('new change');
								console.log(ownerReq);
								$http.put('/ownerChange',ownerReq).
									success(function(data, status){
										console.log('changed the new one');
										console.log(data);
										$location.path('admin-players');
										//admin-players
									});
							});


					}
				});
		};

		// Find a list of Players
		$scope.find = function() {
			$scope.players = Players.query();
		};

		// Find existing Player
		$scope.findOne = function() {
			$scope.dPlayer = Players.get({
				playerId: $stateParams.playerId
			});
		};

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

		$scope.listFilter = function (position, available) {
			return function (list) {
//                console.log(list.available);
//                console.log(available);
				if(list.available===available || available===''){
					return list.position.match(position);
				}
//                    && list.available.match(available);
			};
		};


		//Filter for finding players
		$scope.sortType='absRank';
		$scope.sortReverse=false;
		$scope.searchPlayer='';
		$scope.filters={};
		$scope.filters.position='';
		$scope.availableString='All Players';
		$scope.filters.available='';
		$scope.availableString='';


	}
]);