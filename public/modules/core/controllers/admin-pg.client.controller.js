'use strict';

angular.module('core').controller('AdminPgController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http ) {
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
			socket.emit('pauseTimer');
		};
		$scope.restartTimer=function(){
			socket.emit('restartTimer');
		};
		// Find a list of Owners
		$scope.findOwners = function() {
			$scope.owners = Owners.query();
			//$scope.owners.push(null);
			$scope.drafter={};
			$scope.drafter._id=null;
			$scope.drafter.name='';
		};
		$scope.changeDrafter = function(){
			socket.emit('changeDrafter', $scope.drafter);
		};
		$scope.endRfa = function(){
			socket.emit('endRfa');
		};




	}
]);