'use strict';

angular.module('core').controller('AdminPgController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http ) {

		//console.log($scope.ownerId);
		//socket.emit('testAsync', $scope.ownerId);
		$scope.resetGvars=function(){
			socket.emit('resetGvars');
		};

		$scope.dumpPlayers=function(){
			socket.emit('dumpPlayers');
		};
		$scope.startRfaDraft=function(){
			socket.emit('startRfaDraft');
		};
		$scope.startRfaMatch=function(){
			socket.emit('startRfaMatch');
		};
		$scope.endRfaMatch=function(){
			socket.emit('endRfaMatch');
		};
		$scope.inbetweenDraft=function(){
			socket.emit('inbetweenDraft');
		};
		$scope.startRookieDraft=function(){
			socket.emit('startRookieDraft');
		};
		$scope.endRookieDraft=function(){
			socket.emit('endRookieDraft');
		};
		$scope.startAuctionDraft=function(){
			socket.emit('startAuctionDraft');
		};
		$scope.endAuctionDraft=function(){
			socket.emit('endAuctionDraft');
		};
		$scope.startSnake=function(){
			socket.emit('startSnake');
		};
		$scope.iterate=function(){
			socket.emit('iterate');
		};
		$scope.executeBid=function(){
			socket.emit('executeBid');
		};
		$scope.timeExample=function(){
			socket.emit('timeExample');
		};
		$scope.resetTime=function(){
			socket.emit('resetTime');
		};
		$scope.stopTime=function(){
			socket.emit('stopTime');
		};
		$scope.pauseTimer=function(){
			console.log('blah');
			socket.emit('pauseTimer');
		};
		$scope.restartTimer=function(){
			socket.emit('restartTimer');
		};
		// Find a list of Owners
		$scope.findOwners = function() {
			$http.get('/gvars').
			success(function(data, status){
				$scope.gvar=data[0];

				$scope.bidTimer=$scope.gvar.bidTimer;
				$scope.nomTimer=$scope.gvar.nomTimer;
				$scope.pickTimer=$scope.gvar.pickTimer;
			}).then(function(){
				$scope.owners = Owners.query();
				//$scope.owners.push(null);
				$scope.drafter={};
				$scope.drafter._id=null;
				$scope.drafter.name='';
			});
		};
		$scope.changeDrafter = function(){
			socket.emit('changeDrafter', $scope.drafter);
		};
		$scope.endRfa = function(){
			socket.emit('endRfa');
		};

		$scope.updateTimer=function(timerType){
			var input={};
			input.bidTimer=$scope.bidTimer;
			input.pickTimer=$scope.pickTimer;
			input.nomTimer=$scope.nomTimer;
			input.type=timerType;
			socket.emit('updateTimer', input);
		};

		$scope.updateVars=function(){
			socket.emit('updateDraftVars');
		};


	}
]);