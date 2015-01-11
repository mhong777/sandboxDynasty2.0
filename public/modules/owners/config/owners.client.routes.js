'use strict';

//Setting up route
angular.module('owners').config(['$stateProvider',
	function($stateProvider) {
		// Owners state routing
		$stateProvider.
		state('listOwners', {
			url: '/owners',
			templateUrl: 'modules/owners/views/list-owners.client.view.html'
		}).
		state('createOwner', {
			url: '/owners/create',
			templateUrl: 'modules/owners/views/create-owner.client.view.html'
		}).
		state('viewOwner', {
			url: '/owners/:ownerId',
			templateUrl: 'modules/owners/views/view-owner.client.view.html'
		}).
		state('editOwner', {
			url: '/owners/:ownerId/edit',
			templateUrl: 'modules/owners/views/edit-owner.client.view.html'
		}).
		state('assocPlayers', {
			url: '/assocPlayers',
			templateUrl: 'modules/owners/views/admin-player-owner.html'
		});
	}
]);