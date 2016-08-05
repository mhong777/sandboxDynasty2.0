'use strict';

//Setting up route
angular.module('gvars').config(['$stateProvider',
	function($stateProvider) {
		// Gvars state routing
		$stateProvider.
		state('draft-order', {
			url: '/draft-order',
			templateUrl: 'modules/gvars/views/draft-order.client.view.html'
		}).
		state('listGvars', {
			url: '/gvars',
			templateUrl: 'modules/gvars/views/list-gvars.client.view.html'
		}).
		state('createGvar', {
			url: '/gvars/create',
			templateUrl: 'modules/gvars/views/create-gvar.client.view.html'
		}).
		state('viewGvar', {
			url: '/gvars/:gvarId',
			templateUrl: 'modules/gvars/views/view-gvar.client.view.html'
		}).
		state('editGvar', {
			url: '/gvars/:gvarId/edit',
			templateUrl: 'modules/gvars/views/edit-gvar.client.view.html'
		});
	}
]);