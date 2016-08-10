'use strict';

//Setting up route
angular.module('bidlogs').config(['$stateProvider',
	function($stateProvider) {
		// Bidlogs state routing
		$stateProvider.
		state('analytic-view', {
			url: '/analytic-view',
			templateUrl: 'modules/bidlogs/views/analytic-view.client.view.html'
		}).
		state('listBidlogs', {
			url: '/bidlogs',
			templateUrl: 'modules/bidlogs/views/list-bidlogs.client.view.html'
		}).
		state('createBidlog', {
			url: '/bidlogs/create',
			templateUrl: 'modules/bidlogs/views/create-bidlog.client.view.html'
		}).
		state('viewBidlog', {
			url: '/bidlogs/:bidlogId',
			templateUrl: 'modules/bidlogs/views/view-bidlog.client.view.html'
		}).
		state('editBidlog', {
			url: '/bidlogs/:bidlogId/edit',
			templateUrl: 'modules/bidlogs/views/edit-bidlog.client.view.html'
		});
	}
]);