'use strict';

angular.module('users').filter('hasOwner', function() {
		return function(input) {

			console.log('hi');
			console.log(input[0]);
			return input;

			//var filtered=[];
			//for (var i=0; i<input.length(); i++){
			//	if(input[i].myUser==undefined || input[i].myUser==''){
			//		filtered.push(input[i]);
			//	}
			//}
			//return filtered;

		};
});