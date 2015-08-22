module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
    Player = mongoose.model('Player'),
	User = mongoose.model('User'),
    Bid = mongoose.model('Bid'),
    Gvar = mongoose.model('Gvar'),
	_ = require('lodash');
    

    var maxPlayers=22,
        salaryCap=315;

    io.on('connection', function(socket){
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });

        /**********
         * ALL OF THE DRAFT MECHANICS
         **********/
        socket.on('startRfaDraft', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=true;
                    gvar.matchShow=false;
                    gvar.timerShow=true;
                    gvar.draftShow=false;
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('startRfaMatch', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=false;
                    gvar.matchShow=true;
                    gvar.timerShow=true;
                    gvar.draftShow=false;
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('inbetweenDraft', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=false;
                    gvar.matchShow=false;
                    gvar.timerShow=true;
                    gvar.draftShow=false;
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('startRookieDraft', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=false;
                    gvar.matchShow=false;
                    gvar.timerShow=true;
                    gvar.draftShow=false;
                    gvar.rookieDraft=true;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('startAuctionDraft', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=true;
                    gvar.matchShow=false;
                    gvar.timerShow=true;
                    gvar.draftShow=false;
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('startSnake', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.bidShow=false;
                    gvar.matchShow=false;
                    gvar.timerShow=true;
                    gvar.draftShow=true;
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });


        /**********
         * DRAFT STUFF
         **********/

        socket.on('draft', function(input){
            //player modification
                //change to unavailable
                //change owner
                //change price
                //save
                //grab all players
                //send
            //owner modification
                //add player to keeper list
                //save
                //grab all owners
                //send
            //bid modification
                //if bid is not null
                //find bid and remove it
                //grab all bids
                //send

            modDraftPlayer(input.playerId,input.price,input.ownerId);
            modDraftOwner(input.playerId,input.ownerId);
            modDraftBid(input.bidId);
        });

        function modDraftPlayer(playerId, price, ownerId){
            Player.findById(playerId).exec(function(err, player) {
                if (err) {
                    console.log(err);
                } else {
                    player.price=price;
                    player.owner=ownerId;
                    player.available=false;
                    player.save();
                }
            }).then(function(){
                //emit new bids to update everything
                Player.find().populate('owner', 'name').exec(function(err, players) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updatePlayers', players);
                        console.log('updated player');
                    }
                });
            });
        };

        function modDraftOwner(playerId, ownerId){
            Owner.findById(ownerId).exec(function(err, owner) {
                if (err) {
                    console.log(err);
                } else {
                    owner.keepRoster.push(playerId);
                    owner.save();
                }
            }).then(function(){
                //emit new bids to update everything
                Player.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updateOwners', owners);
                        console.log('updated owner');
                    }
                });
            });
        };

        function modDraftBid(bidId){
            Bid.findById(bidId).exec(function(err, bid) {
                if (err) {
                    console.log(err);
                } else {
                    bid.remove();
                }
            }).then(function(){
                //emit new bids to update everything
                Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updateBids', bids);
                        console.log('updated bid');
                    }
                });
            });
        };


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
                                    player.price=0;
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




//                $scope.selectedPlayer=player;
        /**************
         ***************/
    });
    
};