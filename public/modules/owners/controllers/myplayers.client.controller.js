'use strict';

angular.module('owners').controller('MyplayersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owners', 'Players', 'socket',
    function($scope, $stateParams, $location, Authentication, Owners, Players, socket ) {

        // Find existing Owner
        $scope.initialze= function() {
            $scope.owner = Owners.get({
                ownerId: $stateParams.ownerId
            });
            $scope.players = Players.query();
        };
        $scope.initialze();

        //Assign Players
        $scope.assignPlayer=function(player){
            if(player.available){
                var input={};
                input.ownerId=$scope.owner._id;
                input.playerId=player._id;

                socket.emit('choosePlayer', input);
                $scope.owner.previousRoster.push(player);
                player.available=false;
            }
        };

        //Unassign Players
        $scope.unassignPlayer=function(player){
            var input={};
            input.ownerId=$scope.owner._id;
            input.playerId=player._id;

            for (var x=0;x<$scope.owner.previousRoster.length;x++){
                if($scope.owner.previousRoster[x]._id==player._id){
                    $scope.owner.previousRoster.splice(x,1);
                    input.playerLoc=x;

                    break;
                }
            }

            for (x=0;x<$scope.players.length;x++){
                if($scope.players[x]._id==player._id){
                    $scope.players[x].available=true;
                    break;
                }
            }

            socket.emit('unchoosePlayer', input);
        };


        //filter by position
        $scope.addFilter=function(position){
            $scope.filters.position.push(position);
        };

        $scope.listFilter = function (position) {
            return function (list) {
                return list.position.match(position);
            };
        };


    }
]);