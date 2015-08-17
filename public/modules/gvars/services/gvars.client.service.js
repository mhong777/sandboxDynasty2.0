'use strict';

//Gvars service used to communicate Gvars REST endpoints
angular.module('gvars').factory('Gvars', ['$resource',
	function($resource) {
		return $resource('gvars/:gvarId', { gvarId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);