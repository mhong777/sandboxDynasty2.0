'use strict';

// Owners controller
angular.module('owners').controller('assocPlayerController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket',
	function($scope, $stateParams, $location, Authentication, Owners, Players, socket ) {
		$scope.authentication = Authentication;

        
        /***
        ***INITIALIZATION
        ***Find a list of Owners
        ***/
		$scope.find = function() {
			$scope.owners = Owners.query();
            $scope.players = Players.query();            
            $scope.selectedOwner={};
            $scope.selectedPlayer={};
            $scope.counter=0;
		};
        
        $scope.selectOwner=function(owner){
              $scope.selectedOwner=owner;
        };
        
        //outgoing call
        $scope.selectPlayer=function(player){
            //make sure the owner is selected first
            if($scope.selectedOwner._id){
                $scope.input={};
                $scope.input.ownerId=$scope.selectedOwner._id;
                $scope.input.playerId=player._id;
                socket.emit('choosePlayer', $scope.input);
            }  
        };
        //response
        socket.on('playerChosen', function(output){
            $scope.selectedOwner=output.owner;
            $scope.$digest();
        });        
        
        
        
        
        
        /*****
        **TIMER
        *****/
        socket.on('timer', function (data) {
            $scope.counter=data.countdown;
            $scope.$digest();
        });

        $scope.startTimer=function(){            
            socket.emit('startTimer', 10);
        };        
        
        $scope.resetTimer=function(){
            console.log('go reset');
            socket.emit('reset');
        };        
        
	}
]);