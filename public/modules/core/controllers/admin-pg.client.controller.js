'use strict';

angular.module('core').controller('AdminPgController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http ) {
		$scope.dumpPlayers=function(){
			socket.emit('dumpPlayers');
		};

		$scope.ownerId=Authentication.user.ownerId;

		console.log(Authentication);

		$scope.testAsync=function(){
			console.log($scope.ownerId);
			socket.emit('testAsync', $scope.ownerId);
		};

	}
]);