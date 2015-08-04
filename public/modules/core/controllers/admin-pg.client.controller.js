'use strict';

angular.module('core').controller('AdminPgController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket', '$http',
	function($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http ) {
		$scope.dumpPlayers=function(){
			socket.emit('dumpPlayers');
		};

	}
]);