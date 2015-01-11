module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
    Player = mongoose.model('Player'),
	User = mongoose.model('User'),    
	_ = require('lodash');
    

    
        
    io.on('connection', function(socket){
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });    
        
        /*****
        ***ASSOCIATE PLAYER PAGE
        *****/
        
        //SELECT A PLAYER
        socket.on('choosePlayer', function(input){
            //get selected owner
            Owner.findById(input.ownerId).exec(function(err, owner) {
                if (err) {
                    console.log(err);
                } else {
                    //toggle the player in the roster
                    var playerTest=0;                
                    for(var x=0;x<owner.previousRoster.length;x++){
                        if(owner.previousRoster[x]==input.playerId){
                            console.log('remove');
                            playerTest=1;
                            console.log(owner.previousRoster);
                            owner.previousRoster.splice(x,1);
                            break;
                        }
                    }
                    if(playerTest===0){
                        console.log('add');
                        owner.previousRoster.push(input.playerId);    
                    }                
                    
                    owner.save();
                    console.log('after\n' + owner);
                    var output={};
                    output.owner=owner;
                    io.emit('playerChosen', output);
                    

                    Player.findById(input.playerId).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            if(player.owner){
                                
                                /**************
                                FJEIFJEIFJEIFJE
                                //work out all the cases
                                **************/
                                if(playerTest===0){
                                    player.owner=input.ownerId;
                                }
                                else{
                                    player.owner='';
                                }                                
                            }
                            else{
                                if(playerTest===0){
                                    player.owner=input.ownerId;
                                }
                                else{
                                    player.owner='';
                                }
                            }
                            console.log(player);
                        }
                    });                                                            
                }
            });             
        });
//                $scope.selectedPlayer=player;
        
        
        
        /*****
        *TIMER EXAMPLE
        ****/
        var countdown;
        socket.on('startTimer', function(input){
            console.log(input);
            countdown = input;
            io.emit('timer', { countdown: countdown });
            var intervalId = setInterval(function() {
                if(countdown===0){
                    clearInterval(intervalId);
                }
                else{
                    countdown--;
                    console.log(countdown);
                    io.emit('timer', { countdown: countdown });                    
                }                
            }, 1000);            
        });
        
        
        socket.on('reset', function (data) {
            console.log('reset');
            countdown = 1000;
            io.emit('timer', { countdown: countdown });
//            io.sockets.emit('timer', { countdown: countdown });
        });      
        
        
        
        
    });          
    
};