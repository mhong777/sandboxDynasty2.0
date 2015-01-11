'use strict';

// Configuring the Articles module
angular.module('owners').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Owners', 'owners', 'dropdown', '/owners(/create)?');
		Menus.addSubMenuItem('topbar', 'owners', 'List Owners', 'owners');
		Menus.addSubMenuItem('topbar', 'owners', 'New Owner', 'owners/create');
	}
]);