module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
    Player = mongoose.model('Player'),
	User = mongoose.model('User'),
    Bid = mongoose.model('Bid'),
	_ = require('lodash');
    

    var maxPlayers=22,
        salaryCap=300;
        
    io.on('connection', function(socket){
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });

        /**********
         * MOD RFA BID
         **********/
        socket.on('modRfaBid', function(input){
            //at some point should probably do some validation
            //  - check the owner can handle salary
            //  -
            //grab the bid
            //make sure the bid is higher
            //mod the bid
            //save the bid
            //emit the bid
            var bidId=input.bid._id,
                newPrice=input.bid.myBid,
                ownerId=input.owner,
                allBids,
                myOwner,
                salary= 0,
                x, y,
                numPlayer=0;

            //grab the owner
            //grab all the bids
            //mod the specific bid

            Owner.findById(ownerId).populate('keepRoster', 'price').exec(function(err, owner) {
                if (err) {
                    console.log(err);
                } else {
                    myOwner=owner;
                }
            }).then(function(){
                Bid.find().exec(function(err, bids) {
                    if (err) {
                        console.log(err);
                    } else {
                        allBids=bids;
                    }
                }).then(function(){
                    //calculate the salary and num players
                    for(x=0;x<myOwner.keepRoster.length;x++){
                        //console.log(myOwner.keepRoster[x]);
                        salary+=myOwner.keepRoster[x].price;
                        numPlayer++
                    }
                    console.log(allBids);
                    console.log(allBids.length);
                    for(y=0;y<allBids.length;y++){
                        console.log(y);
                        console.log(allBids[y]);
                        if(allBids[y].owner==ownerId){
                            if(allBids[y]._id==bidId){
                                salary+=newPrice;
                            }
                            else{
                                console.log(allBids[y].price);
                                salary+=allBids[y].price;
                            }
                            numPlayer++
                        }
                    }
                    console.log(salary);
                    if(salary<=salaryCap && numPlayer<=maxPlayers) {
                        Bid.findById(bidId).exec(function(err, bid) {
                            if (err) {
                                console.log(err);
                            } else {
                                bid.price=newPrice;
                                bid.owner=ownerId;
                                bid.save();
                            }
                        }).then(function(){
                            //emit new bids to update everything
                            Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids2) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('sending message');
                                    console.log(bids2);
                                    io.emit('updateRfa', bids2);
                                }
                            });
                        });
                    }
                    else{
                        console.log('validation failed')
                    }
                });
            });

        });


        /***********
         * DUMP ALL PLAYERS AT END OF OFFSEASON AND INITIALIZE RFA BIDS
         ***********/
        socket.on('dumpPlayers', function(){
            //grab all owners and loop through them and pick out players still in previous roster
                //change the price to 0 //change available to true //change owner to null //change yearsowned to 0 //save player
                //empty previous roster array //save owner
                //create a new bid with everyone in the rfa pool
            var owner,
                playerId,
                counter=0,
                bidPlayer,
                x, y, z;

            Owner.find().populate('bidRoster', 'price').exec(function(err, owners) {
                if (err) {
                    console.log(err);
                } else {
                    for(x=0;x<owners.length;x++){
                        owner=owners[x];
                        console.log(owner.name);
                        for(y=0;y<owner.previousRoster.length;y++){
                            playerId=owner.previousRoster[y];
                            //change the player
                            Player.findById(playerId).exec(function(err, player) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    player.available=true;
                                    player.owner=null;
                                    player.yearsOwned=0;
                                    player.save();
                                    console.log(player.name);
                                }
                            }).then(function(){
                                counter=counter;
                            });
                        }
                        owner.previousRoster.splice(0,owner.previousRoster.length);
                        owner.save();

                        for(z=0;z<owner.bidRoster.length;z++){
                            counter++
                            bidPlayer=owner.bidRoster[z];
                            //initialize bids
                            var bidInput={};
                            bidInput.name='bid_'+bidPlayer._id;
                            bidInput.user='55a8480cb2e1feb90228656f';
                            bidInput.price=bidPlayer.price;
                            bidInput.player=bidPlayer._id;
                            bidInput.owner=owner._id;
                            bidInput.origOwner=owner._id;

                            var bid=new Bid(bidInput);
                            bid.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(bid);
                                }
                            });
                        }
                    }
                }
            });
        });

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
                    io.emit('finalMsg', {msg:'worked!'});
                }
                else{
                    countdown--;
                    console.log(countdown);
                    io.emit('timer', { countdown: countdown });                    
                }                
            }, 1000);            
        });

        socket.on('getTime', function(){
            io.emit('timer', { countdown: countdown });
        });
        
        socket.on('reset', function (data) {
            console.log('reset');
            countdown = 10;
            io.emit('timer', { countdown: countdown });
//            io.sockets.emit('timer', { countdown: countdown });
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
                    owner.previousRoster.push(input.playerId);
                    owner.save();
                    console.log('after\n' + owner);
                }
            }).then(function(){
                //change the player
                Player.findById(input.playerId).exec(function(err, player) {
                    if (err) {
                        console.log(err);
                    } else {
                        player.available=false;
                        player.owner=input.ownerId;
                        player.save();
                        console.log(player);
                    }
                });
            });
        });

        socket.on('unchoosePlayer', function(input){
            //get selected owner
            Owner.findById(input.ownerId).exec(function(err, owner) {
                if (err) {
                    console.log(err);
                } else {
                    owner.previousRoster.splice(input.playerLoc,1);
                    owner.save();
                    console.log('after\n' + owner);
                }
            }).then(function(){
                //change the player
                Player.findById(input.playerId).exec(function(err, player) {
                    if (err) {
                        console.log(err);
                    } else {
                        player.available=true;
                        player.owner=null;
                        player.save();
                        console.log(player);
                    }
                });
            });
        });
//                $scope.selectedPlayer=player;
        /**************
         ***************/
    });
    
};