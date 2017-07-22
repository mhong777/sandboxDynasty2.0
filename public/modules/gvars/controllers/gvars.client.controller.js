'use strict';

// Gvars controller
angular.module('gvars').controller('GvarsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Gvars', 'Owners', 'socket', '$http',
	function($scope, $stateParams, $location, Authentication, Gvars, Owners, socket, $http) {
		$scope.authentication = Authentication;

		// Create new Gvar
		$scope.create = function() {
			// Create new Gvar object
			var gvar = new Gvars ({
				name: this.name
			});

			// Redirect after save
			gvar.$save(function(response) {
				$location.path('gvars/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Gvar
		$scope.remove = function(gvar) {
			if ( gvar ) { 
				gvar.$remove();

				for (var i in $scope.gvars) {
					if ($scope.gvars [i] === gvar) {
						$scope.gvars.splice(i, 1);
					}
				}
			} else {
				$scope.gvar.$remove(function() {
					$location.path('gvars');
				});
			}
		};

		// Update existing Gvar
		$scope.update = function() {
			var gvar = $scope.gvar;

			gvar.$update(function() {
				$location.path('gvars/' + gvar._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Gvars
		$scope.find = function() {
			$scope.gvars = Gvars.query();
		};


		//ROOKIE DRAFT ORDER
		$scope.startDraftOrder = function(){
			var x;
			x= $scope.gvar.draftOrder;
			$scope.draft=x;
		};

		//OTHER DRAFT ORDER
		$scope.startpickOrder = function(){
			var x;
			x= $scope.gvar.pickOrder;
			$scope.pickDraft=x;
		};

		$scope.addPick = function(){
			$scope.pickDraft.push(null);
		};

		// Find existing Gvar
		$scope.findOne = function() {
			$scope.gvar = Gvars.get({
				gvarId: $stateParams.gvarId
			});
			$scope.owners = Owners.query();
			$scope.draft;
			$scope.draftTimer=0;
		};

		$scope.startTimer=function(){
			socket.emit('startTimer', $scope.draftTimer);
		};





		//Find only gvar
		$scope.getGvar=function(){
			$http.get('/onlyGvar').
			success(function(data, status){
				$scope.gvar=data;
			}).then(function(){
				$scope.owners = Owners.query();
			});
		};

		$scope.addDraft = function(listType){
			if(listType=='rookie'){
				$scope.gvar.draftOrder.push(null);
			}
			else{
				$scope.gvar.pickOrder.push(null);
			}
		};

		$scope.removePick=function(listType,arrayIndex){
			if(listType=='rookie'){
				$scope.gvar.draftOrder.splice(arrayIndex,1);
			}
			else{
				$scope.gvar.pickOrder.splice(arrayIndex,1);
			}
		};

		$scope.changeDraft=function(listType, index,pick){
			if(listType=='rookie'){
				$scope.gvar.draftOrder.splice(index,1,pick);
			}
			else{
				$scope.gvar.pickOrder.splice(index,1,pick);
			}
		};

        $scope.changePick=function(index,pick){
            $scope.gvar.pickOrder.splice(index,1,pick._id);
        };


        $scope.updateDraft=function(){
			var input={},
				draftOrder=[],
				pickOrder=[],
				i;

			for(i=0;i<$scope.gvar.draftOrder.length;i++){
				draftOrder.push($scope.gvar.draftOrder[i]._id);
			}
			for(i=0;i<$scope.gvar.pickOrder.length;i++){
				pickOrder.push($scope.gvar.pickOrder[i]._id);
			}

			input.draftOrder=draftOrder;
			input.pickOrder=pickOrder;

			socket.emit('updateDraftPicks', input);

		};




	}
]);