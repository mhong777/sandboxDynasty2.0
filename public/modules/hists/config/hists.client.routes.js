'use strict';

//Setting up route
angular.module('hists').config(['$stateProvider',
	function($stateProvider) {
		// Hists state routing
		$stateProvider.
		state('listHists', {
			url: '/hists',
			templateUrl: 'modules/hists/views/list-hists.client.view.html'
		}).
		state('createHist', {
			url: '/hists/create',
			templateUrl: 'modules/hists/views/create-hist.client.view.html'
		}).
		state('viewHist', {
			url: '/hists/:histId',
			templateUrl: 'modules/hists/views/view-hist.client.view.html'
		}).
		state('editHist', {
			url: '/hists/:histId/edit',
			templateUrl: 'modules/hists/views/edit-hist.client.view.html'
		});
	}
]);