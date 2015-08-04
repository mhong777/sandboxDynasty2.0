'use strict';

angular.module('owners').controller('RemoveOwnerController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Owners',
	function($scope, $http, $location, Users, Authentication, Owners) {
		$http.get('/allUsers').
			success(function(data, status){
				$scope.allUsers=data;
			});



	}
]);