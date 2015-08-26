module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
    Player = mongoose.model('Player'),
	User = mongoose.model('User'),
    Bid = mongoose.model('Bid'),
    Gvar = mongoose.model('Gvar'),
	_ = require('lodash');



    var maxPlayers=10,
        salaryCap=315;

    /*****
     *TIMER FUNCTIONS
     ****/
    var rfaInterval, rfaCountdown,
        matchInterval, matchCountdown,
        pickInterval, pickCountdown,
        nomInterval, nomCountdown,
        bidInterval, bidCountdown;

    function allDraftTimer(){
        var gvar, input, sampleUser, bid;
        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                gvar=gvars[0];
                if(gvar.rfaDraft && !gvar.matchShow){
                    rfaCountdown = gvar.rfaTimer;
                    io.emit('timer', { countdown: rfaCountdown });
                    rfaInterval = setInterval(function() {
                        if(rfaCountdown===0){
                            //don't do anything
                            clearInterval(rfaInterval);
                            console.log('end');
                            io.emit('finalMsg', {msg:'worked!'});
                        }
                        else{
                            rfaCountdown--;
                            console.log(rfaCountdown);
                            io.emit('timer', { countdown: rfaCountdown });
                        }
                    }, 1000);
                }
                else if(gvar.rfaDraft && gvar.matchShow){
                    matchCountdown = gvar.matchTimer;
                    io.emit('timer', { countdown: matchCountdown });
                    matchInterval = setInterval(function() {
                        if(matchCountdown===0){
                            //don't do anything here either
                            clearInterval(matchInterval);
                            console.log('end');
                            io.emit('finalMsg', {msg:'worked!'});
                        }
                        else{
                            matchCountdown--;
                            console.log(matchCountdown);
                            io.emit('timer', { countdown: matchCountdown });
                        }
                    }, 1000);
                }
                else if(gvar.rookieDraft || gvar.snakeDraft){
                    pickCountdown = gvar.pickTimer;
                    io.emit('timer', { countdown: pickCountdown });
                    pickInterval = setInterval(function() {
                        if(pickCountdown===0){
                            //draft the next up and iterate
                            clearInterval(pickInterval);
                            console.log('rookie wasnt drafted so autodrafting');

                            modDraftPlayer(gvar.upNext,0,gvar.drafter);
                            modDraftOwner(gvar.upNext,gvar.drafter);
                            //if(input.bidId!=null){
                            //    modDraftBid(input.bidId);
                            //}
                            iterateDraft();
                        }
                        else{
                            pickCountdown--;
                            console.log(pickCountdown);
                            io.emit('timer', { countdown: pickCountdown });
                        }
                    }, 1000);
                }
                else if(gvar.auctionDraft && gvar.nomShow){
                    nomCountdown = gvar.nomTimer;
                    io.emit('timer', { countdown: nomCountdown });
                    console.log(nomCountdown);
                    nomInterval = setInterval(function() {
                        if(nomCountdown===0){
                            //nominate the next up
                            clearInterval(nomInterval);
                            console.log('no one was nominated so autodrafted');
                            User.find().exec(function(err, users) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    sampleUser=users[0]._id;
                                }
                            }).then(function(){
                                input={};
                                input.price=1;
                                input.player=gvar.upNext;
                                input.owner=gvar.drafter;
                                input.user=sampleUser;
                                input.origOwner=null;
                                input.name='bid for ' + gvar.upNext;
                                nominate(input);
                            });
                        }
                        else{
                            nomCountdown--;
                            console.log(nomCountdown);
                            io.emit('timer', { countdown: nomCountdown });
                        }
                    }, 1000);
                }
                else if(gvar.auctionDraft && !gvar.nomShow){
                    bidCountdown = gvar.bidTimer;
                    io.emit('timer', { countdown: bidCountdown });
                    bidInterval = setInterval(function() {
                        if(bidCountdown===0){
                            //execute the bid
                            clearInterval(bidInterval);
                            console.log('auction for the player ended');
                            Bid.find().exec(function(err, bids) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    bid=bids[0];
                                    console.log(bids);
                                    console.log('********');
                                    console.log(bid);
                                    modDraftPlayer(bid.player,bid.price,bid.owner);
                                    modDraftOwner(bid.player,bid.owner);
                                    modDraftBid(bid._id);
                                    iterateDraft();
                                }
                            });
                        }
                        else{
                            bidCountdown--;
                            console.log(bidCountdown);
                            io.emit('timer', { countdown: bidCountdown });
                        }
                    }, 1000);
                }
            }
        });
    };

    function resetAllDraftTimer(){
        console.log('reset');
        var gvar;
        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                gvar=gvars[0];
                if(gvar.auctionDraft && !gvar.nomShow){
                    bidCountdown = gvar.bidTimer;
                }

            }
        });
    };

    function stopAllDraftTimer(){
        clearInterval(rfaInterval);
        clearInterval(matchInterval);
        clearInterval(pickInterval);
        clearInterval(nomInterval);
        clearInterval(bidInterval);
    };

    /**********
     * DRAFT FUNCTIONS
     *********/


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
        console.log(ownerId);
        console.log(playerId);
        Owner.findById(ownerId).exec(function(err, owner) {
            if (err) {
                console.log(err);
            } else {
                owner.keepRoster.push(playerId);
                owner.save();
            }
        }).then(function(){
            //emit new bids to update everything
            Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                if (err) {
                    console.log(err);
                } else {
                    io.emit('updateOwners', owners);
                    console.log('updated owner');
                    //console.log(owners);
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

    function nominate (input){
        var bid=new Bid(input);
        bid.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log(bid);
            }
        });

        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                var gvar=gvars[0];
                gvar.nomShow=false;

                gvar.save();
                io.emit('updateGvar', gvar);
            }
        }).then(function(){
            Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    io.emit('updateBids', bids);
                    console.log('updated bid');
                }
            });
        }).then(function(){
            allDraftTimer();
        });
    };

    function iterateDraft(){
        console.log('iterating draft');
        var gvar, upNext, endAuction=true, x, drafter, allOwners, testOwner, y, tester, startTimer=true, rgvar;
        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                gvar=gvars[0];
            }
        }).then(function(){
            if(gvar.rookieDraft){
                console.log('rookie');
                gvar.draftPosition++
                if(gvar.draftPosition<gvar.draftOrder.length){
                    //get upnext and then new thing
                    //send
                    Player.find({rookie: true, available: true}).sort('absRank').limit(1).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            upNext=player[0]._id;
                            console.log(player);
                        }
                    }).then(function(){
                        gvar.drafter=gvar.draftOrder[gvar.draftPosition];
                        gvar.upNext=upNext;
                        gvar.save();
                        io.emit('updateGvar', gvar);
                    }).then(function(){
                        allDraftTimer();
                    });
                }
                else{
                    //end it
                    gvar.drafter=null;
                    gvar.upNext=null;
                    gvar.drafterName='';
                    gvar.timerShow=false;
                    gvar.headerMsg='Rookie Draft has Ended';
                    gvar.rookieDraft=false;
                    gvar.save();
                    io.emit('updateGvar', gvar);

                    console.log('end the rooke draft');
                }
            }
            else if(gvar.auctionDraft){
                console.log('auction');

                Owner.find().populate('keepRoster', 'price').exec(function(err, owners) {
                    allOwners=owners;
                }).then(function(){
                    console.log(gvar.pickOrder);
                    console.log(allOwners);
                    for (x=0;x<gvar.pickOrder.length;x++){
                        gvar.draftPosition++
                        if(gvar.draftPosition>=gvar.pickOrder.length){
                            gvar.draftPosition=0;
                        }
                        drafter=String(gvar.pickOrder[gvar.draftPosition]);
                        console.log(allOwners.length);
                        for(y=0;y<allOwners.length;y++){
                            console.log('"' + allOwners[y]._id + '"');
                            console.log(typeof String(allOwners[y]._id));
                            console.log('"' + drafter + '"');
                            console.log(typeof String(drafter));
                            if(String(allOwners[y]._id)==drafter){
                                console.log('found');
                                testOwner=allOwners[y];
                                break;
                            }
                            else{console.log('not');}
                        }
                        console.log(testOwner);
                        console.log('going through the list');
                        console.log(testOwner.name);
                        tester=checkAuctionOwner(testOwner);

                        if(tester){
                            Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    upNext=player[0]._id;
                                    console.log(player);
                                }
                            }).then(function(){
                                gvar.drafterName=testOwner.name;
                                gvar.drafter=gvar.pickOrder[gvar.draftPosition];
                                gvar.nomShow=true;
                                gvar.upNext=upNext;
                                gvar.save();
                                io.emit('updateGvar', gvar);
                            }).then(function(){
                                allDraftTimer();
                            });
                            endAuction=false;
                            break;
                        }
                    }
                    if(endAuction){
                        //end it
                        gvar.drafter=null;
                        gvar.upNext=null;
                        gvar.bidShow=false;
                        gvar.auctionDraft=false;
                        gvar.timerShow=false;
                        gvar.headerMsg='Auction Draft has Ended';
                        gvar.drafterName='';
                        gvar.save();
                        io.emit('updateGvar', gvar);

                        console.log('end the auction draft');
                    }

                }).then(function(){
                    startTimer=false;
                });
            }
            else if(gvar.snakeDraft){
                console.log('snake');

                Owner.find().populate('keepRoster', 'price').exec(function(err, owners) {
                    allOwners=owners;
                }).then(function(){
                    console.log(gvar.pickOrder);
                    console.log(allOwners);
                    for (x=0;x<gvar.pickOrder.length;x++){
                        gvar.draftPosition++
                        if(gvar.draftPosition>=gvar.pickOrder.length){
                            gvar.draftPosition=0;
                        }
                        drafter=String(gvar.pickOrder[gvar.draftPosition]);
                        console.log(allOwners.length);
                        for(y=0;y<allOwners.length;y++){
                            //console.log('"' + allOwners[y]._id + '"');
                            //console.log(typeof String(allOwners[y]._id));
                            //console.log('"' + drafter + '"');
                            //console.log(typeof String(drafter));
                            if(String(allOwners[y]._id)==drafter){
                                console.log('found');
                                testOwner=allOwners[y];
                                break;
                            }
                            else{console.log('not');}
                        }
                        console.log(testOwner);
                        console.log('going through the list');
                        console.log(testOwner.name);

                        if(testOwner.keepRoster.length<maxPlayers){
                            Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    upNext=player[0]._id;
                                    console.log(player);
                                }
                            }).then(function(){
                                gvar.drafterName=testOwner.name;
                                gvar.drafter=gvar.pickOrder[gvar.draftPosition];
                                gvar.nomShow=true;
                                gvar.upNext=upNext;
                                gvar.save();
                                io.emit('updateGvar', gvar);
                            }).then(function(){
                                allDraftTimer();
                            });
                            endAuction=false;
                            break;
                        }
                    }
                    if(endAuction){
                        //end it
                        gvar.drafter=null;
                        gvar.upNext=null;
                        gvar.bidShow=false;
                        gvar.auctionDraft=false;
                        gvar.timerShow=false;
                        gvar.headerMsg='The Draft has Ended. Good Luck!';
                        gvar.drafterName='';
                        gvar.save();
                        io.emit('updateGvar', gvar);

                        console.log('end the draft has ended');
                    }

                }).then(function(){
                    startTimer=false;
                });
            }
        });
    };

    function checkAuctionOwner(testOwner){
        var x, salary= 0, numPlayer=0;
        for(x=0;x<testOwner.keepRoster.length;x++){
            //console.log(myOwner.keepRoster[x]);
            salary+=testOwner.keepRoster[x].price;
            numPlayer++
        }
        console.log(testOwner.name);
        console.log(salary);
        console.log(numPlayer);
        if(salary<salaryCap && numPlayer<maxPlayers){
            console.log('found true');
            return true;
        }
        else{
            console.log('found false');
            return false;
        }
    };


    /************
     *
     ************/

    function inbetweenDraft(){
        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                var gvar=gvars[0];
                gvar.bidShow=false;
                gvar.matchShow=false;
                gvar.timerShow=false;
                gvar.draftShow=false;
                gvar.nomShow=false;
                gvar.rfaDraft=false;
                gvar.rookieDraft=false;
                gvar.auctionDraft=false;
                gvar.snakeDraft=false;
                gvar.drafter=null;
                gvar.drafterName='';
                gvar.headerMsg='In between draft';
                gvar.save();
                io.emit('updateGvar', gvar);
            }
        });
    };


    io.on('connection', function(socket){
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });

        /**********
         * ALL OF THE DRAFT MECHANICS
         **********/
        socket.on('changeDrafter', function(drafter){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.drafter=drafter._id;
                    gvar.drafterName=drafter.name;
                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });

        socket.on('pauseTimer', function(){
            stopAllDraftTimer();
        });

        socket.on('restartTimer', function(){
            allDraftTimer();
        });

        socket.on('updatePlayers', function(){
            Player.find().populate('owner', 'name').exec(function(err, players) {
                if (err) {
                    console.log(err);
                } else {
                    io.emit('updatePlayers', players);
                    console.log('updated player');
                }
            });
        });

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
                    gvar.nomShow=false;
                    gvar.rookieDraft=false;
                    gvar.rfaDraft=true;
                    gvar.auctionDraft=false;
                    gvar.snakeDraft=false;

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
                    gvar.nomShow=false;
                    gvar.rookieDraft=false;
                    gvar.rfaDraft=true;
                    gvar.auctionDraft=false;
                    gvar.snakeDraft=false;

                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
            });
        });
        socket.on('inbetweenDraft', function(){
            stopAllDraftTimer();
            inbetweenDraft();
        });
        socket.on('startRookieDraft', function(){
            var upNext;
            Player.find({rookie: true, available: true}).sort('absRank').limit(1).exec(function(err, player) {
                if (err) {
                    console.log(err);
                } else {
                    upNext=player[0]._id;
                    console.log(player);
                }
            }).then(function(){
                console.log(upNext);
                Gvar.find().populate('draftOrder', 'name').exec(function(err, gvars) {
                    if (err) {
                        console.log(err);
                    } else {
                        var gvar=gvars[0];
                        gvar.bidShow=false;
                        gvar.matchShow=false;
                        gvar.timerShow=true;
                        gvar.draftShow=false;
                        gvar.nomShow=false;
                        gvar.rookieDraft=true;
                        gvar.rfaDraft=false;
                        gvar.auctionDraft=false;
                        gvar.snakeDraft=false;
                        gvar.draftPosition=0;
                        gvar.drafter=gvar.draftOrder[0]._id;
                        gvar.drafterName=gvar.draftOrder[0].name;
                        gvar.upNext=upNext;
                        gvar.headerMsg='Rookie Draft';
                        //console.log(gvar.upNext);
                        gvar.save();
                        io.emit('updateGvar', gvar);
                    }
                });
            }).then(function(){
                allDraftTimer();
            });
        });
        socket.on('startAuctionDraft', function(){
            var upNext;
            Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
                if (err) {
                    console.log(err);
                } else {
                    upNext=player[0]._id;
                    console.log(player);
                }
            }).then(function(){
                Gvar.find().populate('pickOrder', 'name').exec(function(err, gvars) {
                    if (err) {
                        console.log(err);
                    } else {
                        var gvar=gvars[0];
                        gvar.bidShow=true;
                        gvar.matchShow=false;
                        gvar.timerShow=true;
                        gvar.draftShow=false;
                        gvar.nomShow=true;
                        gvar.rookieDraft=false;
                        gvar.rfaDraft=false;
                        gvar.auctionDraft=true;
                        gvar.snakeDraft=false;
                        gvar.draftPosition=0;
                        gvar.drafter=gvar.pickOrder[0]._id;
                        gvar.drafterName=gvar.pickOrder[0].name;
                        gvar.upNext=upNext;
                        gvar.headerMsg='Auction Draft';

                        gvar.save();
                        io.emit('updateGvar', gvar);
                    }
                }).then(function(){
                    allDraftTimer();
                });
            })
        });
        socket.on('startSnake', function(){
            var upNext;
            Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
                if (err) {
                    console.log(err);
                } else {
                    upNext=player[0]._id;
                    console.log(player);
                }
            }).then(function(){
                Gvar.find().populate('pickOrder', 'name').exec(function(err, gvars) {
                    if (err) {
                        console.log(err);
                    } else {
                        var gvar=gvars[0];
                        gvar.bidShow=false;
                        gvar.matchShow=false;
                        gvar.timerShow=true;
                        gvar.draftShow=true;
                        gvar.nomShow=false;
                        gvar.rookieDraft=false;
                        gvar.rfaDraft=false;
                        gvar.auctionDraft=false;
                        gvar.snakeDraft=true;
                        gvar.draftPosition=0;
                        gvar.drafter=gvar.pickOrder[0]._id;
                        gvar.drafterName=gvar.pickOrder[0].name;
                        gvar.upNext=upNext;
                        gvar.headerMsg='Snake Draft';


                        gvar.save();
                        io.emit('updateGvar', gvar);
                    }
                }).then(function(){
                    allDraftTimer();
                });
            });
        });

        socket.on('iterate', function(){
            stopAllDraftTimer();
            iterateDraft();
        });


        /**********
         * DRAFT STUFF
         **********/
        socket.on('draft', function(input){
            modDraftPlayer(input.playerId,input.price,input.ownerId);
            modDraftOwner(input.playerId,input.ownerId);
            if(input.bidId!=null){
                modDraftBid(input.bidId);
            }
            iterateDraft();
        });

        socket.on('endRfaMatch', function(){
            var x;
            Bid.find().exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    for(x=0;x<bids.length;x++){
                        modDraftPlayer(bids[x].player,bids[x].price,bids[x].owner);
                        modDraftOwner(bids[x].player,bids[x].owner);
                        modDraftBid(bids[x]._id);
                    }
                }
            });
        });

        socket.on('nominate', function(input){
            //need the owner and the player Ids
            //create a bid
            //send it out
            //start the timer
            nominate(input);
        });

        socket.on('executeBid', function(){
            Bid.find().exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    var bid=bids[0];
                    modDraftPlayer(bid.player,bid.price,bid.owner);
                    modDraftOwner(bid.player,bid.owner);
                    modDraftBid(bid._id);
                    iterateDraft();
                }
            });
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
                        console.log('my Owner\n');
                        console.log(myOwner);
                    }
                }).then(function(){
                    //calculate the salary and num players
                    console.log('all Bids\n');
                    console.log(allBids);
                    for(x=0;x<myOwner.keepRoster.length;x++){
                        //console.log(myOwner.keepRoster[x]);
                        salary+=myOwner.keepRoster[x].price;
                        numPlayer++
                    }
                    for(y=0;y<allBids.length;y++){
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
                    console.log('salary\n');
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
                            console.log('wicket 4');
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
                x, y, z, sampleUser;
            User.find().exec(function(err, users) {
                if (err) {
                    console.log(err);
                } else {
                    sampleUser=users[0]._id;
                }
            }).then(function(){
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
                                        player.price=1;
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
                                bidInput.user=sampleUser;
                                //bidInput.price=bidPlayer.price;
                                bidInput.price=1;
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


        socket.on('timeExample', function(){
            draftTimer();
        });

        socket.on('resetTime', function (data) {
            resetTime();
        });

        socket.on('stopTime', function(){
            stopTime();
        });


        /**************
         ***************/
    });
    
};



function findNextPlayer(rookie){
    if(rookie){
        Player.find({rookie: true, available: true}).sort('absRank').limit(1).exec(function(err, player) {
            if (err) {
                console.log(err);
            } else {
                console.log(player);
                return player[0]._id;
            }
        });
    }
    else{
        Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
            if (err) {
                console.log(err);
            } else {
                console.log(player);
                return player[0]._id;
            }
        });
    }
};

var countdown, intervalId;

function draftTimer(){
    var gvar;
    Gvar.find().exec(function(err, gvars) {
        if (err) {
            console.log(err);
        } else {
            gvar=gvars[0];
            countdown = gvar.pickTimer;
            io.emit('timer', { countdown: countdown });
            intervalId = setInterval(function() {
                if(countdown===0){
                    clearInterval(intervalId);
                    console.log('end');
                    io.emit('finalMsg', {msg:'worked!'});
                }
                else{
                    countdown--;
                    console.log(countdown);
                    io.emit('timer', { countdown: countdown });
                }
            }, 1000);
        }
    });
};

function resetTime(){
    console.log('reset');
    var gvar;
    Gvar.find().exec(function(err, gvars) {
        if (err) {
            console.log(err);
        } else {
            gvar=gvars[0];
            countdown = gvar.pickTimer;
        }
    });
};

function stopTime(){
    clearInterval(intervalId);
};

//timer logic
//start rfa
//  set rfa timer
//  at end start the match

//start match
//  set match timer
//  at end execute all bids, clear internal of match timer
//  set timerShow=false

//start rookie
//  set pick timer
//  if someone picks -> clearinterval then iterate
//  end of pick timer auto draft next up and iterate

//end rookie
//  clear interval of pick timer
//  set timeShow=false

//start auction
//  set nominate timer
//  if someone is nominate before time = 0 -> set bid + clear interval of nominate timer
//  if nominate timer = 0 -> nominate next up + start bid timer

//bid timer
//  if a new bid comes in, reset bid timer
//  if bid timer = 0 -> clear interval of bid timer + execute bid

//end auction
//  set timeShow=false

//start snake
//  set pick timer
//  if someone picks -> clearinterval then iterate
//  end of pick timer auto draft next up and iterate

//iterate logic
//different cases for different situations
//if rookie draft - just go to the next player
//go until it the end of the rookie draft list
//then end everything

//if auction - need to check who can still bid
//loop through the pick list
//if you get to the end, set the position to 0 and go again
//go until you've checked everyone
//then end everything

//if snake
//do same as auction, but just check # of ppl
//go until you've checked everyone

