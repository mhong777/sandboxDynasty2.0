'use strict';

//Setting up route
angular.module('owners').config(['$stateProvider',
	function($stateProvider) {
		// Owners state routing
		$stateProvider.
		state('edit-roster', {
			url: '/edit-roster/:ownerId',
			templateUrl: 'modules/owners/views/edit-roster.client.view.html'
		}).
		state('review-roster', {
			url: '/review-roster',
			templateUrl: 'modules/owners/views/review-roster.client.view.html'
		}).
		state('remove-owner', {
			url: '/remove-owner',
			templateUrl: 'modules/owners/views/remove-owner.client.view.html'
		}).
		state('myplayers', {
			url: '/myplayers/:ownerId',
			templateUrl: 'modules/owners/views/myplayers.client.view.html'
		}).
		state('assocplayer', {
			url: '/assocplayer',
			templateUrl: 'modules/owners/views/assocplayer.client.view.html'
		}).
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