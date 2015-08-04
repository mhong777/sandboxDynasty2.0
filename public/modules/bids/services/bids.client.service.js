'use strict';

//Bids service used to communicate Bids REST endpoints
angular.module('bids').factory('Bids', ['$resource',
	function($resource) {
		return $resource('bids/:bidId', { bidId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);