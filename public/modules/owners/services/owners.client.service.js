'use strict';

//Owners service used to communicate Owners REST endpoints
angular.module('owners').factory('Owners', ['$resource',
	function($resource) {
		return $resource('owners/:ownerId', { ownerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('owners').factory('socket', function(){
    //var socket=io.connect('/');
    var socket=io.connect('http://localhost');
    return socket;
});
