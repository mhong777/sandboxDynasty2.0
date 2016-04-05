'use strict';

//Hists service used to communicate Hists REST endpoints
angular.module('hists').factory('Hists', ['$resource',
	function($resource) {
		return $resource('hists/:histId', { histId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);