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


	}
]);