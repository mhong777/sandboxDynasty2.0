'use strict';

//Bidlogs service used to communicate Bidlogs REST endpoints
angular.module('bidlogs').factory('Bidlogs', ['$resource',
	function($resource) {
		return $resource('bidlogs/:bidlogId', { bidlogId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);