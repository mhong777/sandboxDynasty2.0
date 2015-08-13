'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('rules', {
			url: '/rules',
			templateUrl: 'modules/core/views/rules.client.view.html'
		}).
		state('home-page', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).
		state('roster', {
			url: '/roster',
				templateUrl: 'modules/owners/views/review-roster.client.view.html'
		}).
		state('admin-main', {
			url: '/admin-main',
			templateUrl: 'modules/core/views/admin-main.client.view.html'
		});
	}
]);