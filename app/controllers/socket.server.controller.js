module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
    Player = mongoose.model('Player'),
	User = mongoose.model('User'),
    Bid = mongoose.model('Bid'),
    Hist = mongoose.model('Hist'),
    Gvar = mongoose.model('Gvar'),
    Bidlog = mongoose.model('Bidlog'),
    async = require('async'),
	_ = require('lodash');

    var maxPlayers=22,
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



        //owner.save(function(err) {
        //    if (err) {
        //        console.log(err);
        //    } else {
        //        callback(null,owner);
        //    }
        //});
        //
        //async.waterfall([
        //        function(callback){
        //            callback(null,owner);
        //        },
        //        function(owner, callback){
        //            callback(null,owner);
        //        }
        //    ],
        //    function(error, success){
        //        console.log('success all draft timer');
        //    });




        Gvar.find().exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                gvar=gvars[0];
                if(gvar.rfaDraft && !gvar.matchShow){
                    console.log('nothing');
                    //rfaCountdown = gvar.rfaTimer;
                    //io.emit('timer', { countdown: rfaCountdown });
                    //rfaInterval = setInterval(function() {
                    //    if(rfaCountdown===0){
                    //        //don't do anything
                    //        clearInterval(rfaInterval);
                    //        console.log('end');
                    //        io.emit('finalMsg', {msg:'worked!'});
                    //    }
                    //    else{
                    //        rfaCountdown--;
                    //        console.log(rfaCountdown);
                    //        io.emit('timer', { countdown: rfaCountdown });
                    //    }
                    //}, 1000);
                }
                else if(gvar.rfaDraft && gvar.matchShow){
                    console.log('nothing');
                    //matchCountdown = gvar.matchTimer;
                    //io.emit('timer', { countdown: matchCountdown });
                    //matchInterval = setInterval(function() {
                    //    if(matchCountdown===0){
                    //        //don't do anything here either
                    //        clearInterval(matchInterval);
                    //        console.log('end');
                    //        io.emit('finalMsg', {msg:'worked!'});
                    //    }
                    //    else{
                    //        matchCountdown--;
                    //        console.log(matchCountdown);
                    //        io.emit('timer', { countdown: matchCountdown });
                    //    }
                    //}, 1000);
                }
                else if(gvar.rookieDraft || gvar.snakeDraft){
                    pickCountdown = gvar.pickTimer;
                    io.emit('timer', { countdown: pickCountdown });
                    pickInterval = setInterval(function() {
                        if(pickCountdown===0){
                            //draft the next up and iterate
                            clearInterval(pickInterval);
                            console.log('rookie wasnt drafted so autodrafting');

                            modDraftPlayerBlah(gvar.upNext,0,gvar.drafter, null, true);
                            //modHistory(gvar.drafter, 0, gvar.upNext);
                            //iterateDraft();
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
                                    //console.log(bids);
                                    //console.log('********');
                                    console.log(bid);
                                    //modDraftPlayer(bid.player,bid.price,bid.owner);
                                    ////modDraftOwner(bid.player,bid.owner);
                                    //modHistory(bid.owner, bid.price, bid.player);
                                    //modDraftBid(bid._id);
                                    //iterateDraft();
                                }
                            }). then(function(){
                                //%%%%
                                var playerId=bid.player,
                                    price=bid.price,
                                    ownerId=bid.owner;
                                //function modDraftPlayer(playerId, price, ownerId){
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
                                        }).then(function(){
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
                                            }).then(function(){
                                                modDraftBid(bid._id);
                                                modHistory(ownerId, price, playerId);
                                                iterateDraft();
                                            });
                                        });
                                    });
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
    }

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
    }

    function stopAllDraftTimer(){
        clearInterval(rfaInterval);
        clearInterval(matchInterval);
        clearInterval(pickInterval);
        clearInterval(nomInterval);
        clearInterval(bidInterval);
    }

    /********
     * DUMP BEFORE RFA DRAFT
     ********/
    function movePastRfsa(owner, callback){
        async.waterfall([
                function(callback){
                    console.log('working on ' + owner.name);
                    async.eachSeries(owner.previousRoster,removePreviousPlayers, function(){
                        //console.log('finished');
                        var testVar1 = 'moved previous roster';
                        callback(null,testVar1);
                    })
                },
                function(testVar1, callback){
                    owner.previousRoster.splice(0,owner.previousRoster.length);

                    owner.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            var testVar2 = 'removed previous roster';
                            callback(null,testVar2);
                        }
                    });
                },
                function(testVar2, callback){
                    async.eachSeries(owner.bidRoster, createRfaBids.bind(createRfaBids, owner._id) , function(){
                        console.log('moved bid Roster');
                        callback(null, 'moved bid roster');
                    })
                }
            ],
            function(error, success){
                console.log('dumped players for ' + owner.name);
                callback();
            });
    }

    function removePreviousPlayers(playerId, callback){
        Player.findById(playerId).exec(function(err, player) {
            if (err) {
                console.log(err);
            } else {
                player.available=true;
                player.owner=null;
                player.yearsOwned=0;
                player.price=1;

                console.log(player.name);

                player.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback();
                    }
                });
            }
        });
    }

    function createRfaBids(ownerId, playerId, callback){
        async.waterfall([
                function(callback){
                    //get a user
                    User.find().exec(function(err, users) {
                        if (err) {
                            console.log(err);
                        } else {
                            var sampleUser=users[0]._id;
                            callback(null,sampleUser);
                        }
                    });
                },
                function(sampleUser, callback){
                    //create the bid
                    var bidInput={};
                    bidInput.name='bid_' + playerId;
                    bidInput.user=sampleUser;
                    bidInput.price=1;
                    bidInput.player=playerId;
                    bidInput.owner=ownerId;
                    bidInput.origOwner=ownerId;

                    var bid=new Bid(bidInput);

                    bid.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            var testVar2 = 'create bid';
                            callback(null,testVar2);
                        }
                    });
                },
                function(testVar2, callback){
                    //change the player
                    Player.findById(playerId).exec(function(err, biddingPlayer) {
                        if (err) {
                            console.log(err);
                        } else {
                            biddingPlayer.yearsOwned=0;
                            biddingPlayer.save();

                            biddingPlayer.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null, 'change player');
                                }
                            });
                        }
                    });
                }
            ],
            function(error, success){
                callback();
            });
    }



    /**********
     * DRAFT FUNCTIONS
     *********/

    function ownerBidTest(owner,playerId,newPrice){
        var x,
            salary= newPrice,
            numPlayer=owner.keepRoster.length+ 1,    //add 1 for the current bid
            ownerTest;

        async.waterfall([
            function(callback){
                //find all of the bids that you currently own
                //pass it
                for(x=0;x<owner.keepRoster.length;x++){
                    salary+=owner.keepRoster[x].price;
                }

                Bid.find({owner:owner._id}).exec(function(err, bids) {
                    callback(null,bids);
                });
            },
            function(bids, callback){
                //then see if any of them are the player that you are currently bid on
                numPlayer+=bids.length;
                //subtract 1 if you are just reupping a bid and remove the old price
                for(x=0;x<bids.length;x++){
                    salary+=bids[x].price;
                    if(bids[x].player==playerId){
                        numPlayer--;
                        salary-=bids[x].price;
                    }
                }
                console.log(numPlayer + ' - ' + salary);
                if(numPlayer<=maxPlayers && salary<=salaryCap){
                    console.log('true');
                    return(true);
                }
                else{
                    return(false);
                }
                callback(null,'test done');
            }
        ],function(error, success){
            return(true);
        });
    }

    function sendOutBids(){
        Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
            io.emit('updateRfa', bids);
        });
    }


    function modDraftPlayerBlah(playerId, price, ownerId, bidId, iterateFlag){
        async.waterfall([
            function(callback){
                Player.findById(playerId).exec(function(err, player) {
                    if (err) {
                        console.log(err);
                    } else {
                        player.price=price;
                        player.owner=ownerId;
                        player.available=false;
                        player.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(null, player);
                            }
                        });
                    }
                });
            },
            function(player, callback){
                //emit new bids to update everything
                Player.find().populate('owner', 'name').exec(function(err, players) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updatePlayers', players);
                        console.log('updated player');
                        callback(null, players);
                    }
                });
            },
            function(players, callback){
                Owner.findById(ownerId).exec(function(err, owner) {
                    if (err) {
                        console.log(err);
                    } else {
                        owner.keepRoster.push(playerId);
                        owner.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(null, owner);
                            }
                        });
                    }
                });
            },
            function(owner, callback){
                //emit new bids to update everything
                Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updateOwners', owners);
                        console.log('updated owner');
                        modHistory(ownerId, price, playerId);
                        callback(null, owners);
                    }
                });
            },
            function(owners, callback){
                console.log(bidId);
                if(bidId!=null){
                    modDraftBid(bidId);
                }
                if(iterateFlag){
                    iterateDraft();
                }
                callback(null,'test done');
            }
        ],
        function(error, success){
            console.log('modDraftPlayer');
        });
    }

    function executeRfas(bid, callback){
        async.waterfall([
                function(callback){
                    console.log('executing rfa for ' + bid.player + ' ' + bid.price + ' ' + bid.owner);
                    callback(null,modDraftPlayer(bid.player,bid.price,bid.owner));
                },
                function(testVar1, callback){
                    callback(null,modHistory(bid.owner, bid.price, bid.player));
                },
                function(testVar2, callback){
                    callback(null, modDraftBid(bid._id));
                }

            ],
            function(error, success){
                console.log('successfully iterated through ' + bid.player)
                callback();
            });
    }

    function modDraftPlayer(playerId, price, ownerId){

        async.waterfall([
                function(callback){
                    Player.findById(playerId).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            player.price=price;
                            player.owner=ownerId;
                            player.available=false;
                            player.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var testVar1='change the player stuff';
                                    callback(null,testVar1);
                                }
                            });
                        }
                    });
                },
                function(testVar1, callback){
                    //emit new bids to update everything
                    Player.find().populate('owner', 'name').exec(function(err, players) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updatePlayers', players);
                            var testVar2='send out the payers';
                            callback(null,testVar2);
                        }
                    });
                },
                function(testVar2, callback){
                    Owner.findById(ownerId).exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {
                            owner.keepRoster.push(playerId);

                            owner.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var testVar3='add the player to the roster';
                                    callback(null,testVar3);
                                }
                            });
                        }
                    });
                },
                function(testVar3, callback){
                    //emit new bids to update everything
                    Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updateOwners', owners);
                            console.log('send out all of the owners');
                            callback(null, 'finish');
                        }
                    });
                }
            ],
            function(error, success){
                console.log('modified ' + playerId);
                return('modified ' + playerId);
            });
    }

    function modDraftOwner(playerId, ownerId){
        console.log('still got one');
        //console.log(ownerId);
        //console.log(playerId);
        //Owner.findById(ownerId).exec(function(err, owner) {
        //    if (err) {
        //        console.log(err);
        //    } else {
        //        owner.keepRoster.push(playerId);
        //        owner.save();
        //    }
        //}).then(function(){
        //    //emit new bids to update everything
        //    Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
        //        if (err) {
        //            console.log(err);
        //        } else {
        //            io.emit('updateOwners', owners);
        //            console.log('updated owner');
        //            //console.log(owners);
        //        }
        //    });
        //});
    }

    function modDraftBid(bidId){
        //remove a bid
        async.waterfall([
                function(callback){
                    Bid.findById(bidId).exec(function(err, bid) {
                        if (err) {
                            console.log(err);
                        } else {
                            bid.remove(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var testVar2='removed the bid';
                                    callback(null,testVar2);
                                }
                            });
                        }
                    });
                },
                function(testVar2, callback){
                    //emit new bids to update everything
                    Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updateBids', bids);
                            console.log('send out bids');
                            return('sent out bids');
                        }
                    });
                }
            ],
            function(error, success){
                console.log('removed bid for ' + playerId);
                return('mod history for ' + playerId);
            });
    }

    function modHistory(ownerId, price, playerId){
        console.log('modding history');
        var sampleUser, input={}, ownerName, playerName;
        User.find().exec(function(err, users) {
            if (err) {
                console.log(err);
            } else {
                sampleUser=users[0]._id;

                async.waterfall([
                        function(callback){
                            //get a player
                            Player.findById(playerId).exec(function(err, player) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    playerName=player.name;
                                    callback(null,playerName);
                                }
                            });
                        },
                        function(playerName, callback){
                            //make a new history
                            Owner.findById(ownerId).exec(function(err, owner) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    ownerName=owner.name;

                                    input.owner=ownerName;
                                    input.price=price;
                                    input.player=playerName;
                                    input.user=sampleUser;
                                    input.name=playerName + '_' + ownerName;
                                    var hist = new Hist(input);
                                    console.log('adding history');
                                    console.log(hist.player);
                                    hist.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var testVar2='send out the payers';
                                            callback(null,testVar2);
                                        }
                                    });
                                }
                            });
                        },
                        function(testVar2, callback){
                            //send back all of the executed bids
                            Hist.find().sort('-created').exec(function(err, allHist) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('history modded');
                                    io.emit('updateHistory', allHist);
                                    var testVar3='add the player to the roster';
                                    callback(null, 'finish');
                                }
                            });
                        }
                    ],
                    function(error, success){
                        console.log('modded history for ' + playerId);
                        return('mod history for ' + playerId);
                    });
            }
        });
    }


    function nominate (input){
        async.waterfall([
                function (callback) {
                    var bid=new Bid(input);
                    bid.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(bid);
                            callback(null, bid);
                        }
                    });
                },
                function (bid, callback) {
                    Gvar.find().exec(function(err, gvars) {
                        if (err) {
                            console.log(err);
                        } else {
                            var gvar=gvars[0];
                            gvar.nomShow=false;
                            gvar.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    io.emit('updateGvar', gvar);
                                    callback(null,gvar);
                                }
                            });
                        }
                    });
                },
                function (gvar, callback) {
                    Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updateBids', bids);
                            console.log('updated bid');
                            allDraftTimer();
                            callback(null, 'finish');
                        }
                    });
                }
            ],
            function (error, success) {
                console.log('nominated');
            });
    }

    function iterateDraft(){
        console.log('iterating draft');
        //waterfall
        //1 - get gvars and pass
        //2 -   if rookieDraft execute rookieDraftIterate
        //      else if auctionDraft execute auctionDraft
        //      else if snakeDraft execute snakeDraft

        //rookieDraft
        //if draftPosition < number of draft spots
        //  waterfall
        //      1 - get the next available rookie and pass
        //      2 - set the upNext, next drafter, next drafter name, save gvar
        //      3 - emit update gvar, set the timer
        //else
        //  waterfall
        //      1 - get the gvar, set the drafter, upNext, drafterName, timer, etc, and save
        //      2 - stop the draft timer and emit the updated gvar

        //auctionDraft
        //waterfall
        //  1 - get all gvars and pass
        //  2 - get all owners and pass
        //  3 - loop through the draft order and try and find an owner - make a new var in owners that flags if they are still able to draft, pass either go or no go, and drafter
        //  4 - if continue get the next man up and update the gvars
        //      else end the auction

        //snakeDraft
        //do the same thing as auctionDraft


        //get all of the history and pass
        Gvar.find().populate('draftOrder', 'name').exec(function(err, gvars) {
            if (err) {
                console.log(err);
            } else {
                var gvar=gvars[0];
                if(gvar.rookieDraft){
                    iterateRookieDraft(gvar);
                }
                else if(gvar.auctionDraft || gvar.snakeDraft){
                    iterateSnakeDraft(gvar);
                }

            }
        });
    }


    function iterateRookieDraft(gvar){
        gvar.draftPosition++;
        if(gvar.draftPosition<gvar.draftOrder.length) {
            //get upnext and then new thing
            //send
            async.waterfall([
                    function (callback) {
                        //1 - get the next available rookie and pass
                        Player.find({rookie: true, available: true}).sort('absRank').limit(1).exec(function (err, player) {
                            if (err) {
                                console.log(err);
                            } else {
                                var upNext = player[0]._id;
                                callback(null, upNext);
                            }
                        });
                    },
                    function (upNext, callback) {
                        //2 - set the upNext, next drafter, next drafter name, save gvar
                        Gvar.find().exec(function(err, gvars) {
                            if (err) {
                                console.log(err);
                            } else {
                                var newGvar=gvars[0];
                                newGvar.drafter=newGvar.draftOrder[newGvar.draftPosition]._id;
                                newGvar.drafterName=newGvar.draftOrder[newGvar.draftPosition].name;
                                newGvar.upNext=upNext;
                                newGvar.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        callback(null,newGvar);
                                    }
                                });
                            }
                        });
                    },
                    function (newGvar, callback) {
                        //3 - emit update gvar, set the timer
                        io.emit('updateGvar', newGvar);
                        allDraftTimer();
                        callback(null, 'finish');
                    }
                ],
                function (error, success) {
                    console.log('iterated draft');
                });
        }
        else{
            //end it
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var newGvar=gvars[0];
                    newGvar.drafter=null;
                    newGvar.upNext=null;
                    newGvar.drafterName='';
                    newGvar.timerShow=false;
                    newGvar.headerMsg='Rookie Draft has Ended';
                    newGvar.rookieDraft=false;
                    newGvar.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            stopAllDraftTimer();
                            io.emit('updateGvar', newGvar);
                            console.log('end the rookie draft');
                        }
                    });
                }
            });
        }
    }

    function iterateSnakeDraft(gvar){
        async.waterfall([
                function(callback){
                    //  1 - get all owners and pass
                    Owner.find().populate('keepRoster', 'price').exec(function(err, owners) {
                        callback(null,owners);
                    });
                },
                function(allOwners, callback){
                    // 3 - loop through the draft order and try and find an owner -
                    // make a new var in owners that flags if they are still able to draft,
                    // pass either go or no go, and drafter

                    var drafter,
                        testOwner,
                        draftTest,
                        x,
                        endAuction = true;

                    for (x=0;x<gvar.pickOrder.length;x++){
                        gvar.draftPosition++;
                        if(gvar.draftPosition>=gvar.pickOrder.length){
                            gvar.draftPosition=0;
                        }
                        drafter=String(gvar.pickOrder[gvar.draftPosition]);
                        for(y=0;y<allOwners.length;y++){
                            if(String(allOwners[y]._id)==drafter){
                                testOwner=allOwners[y];
                                break;
                            }
                        }

                        draftTest=checkAuctionOwner(testOwner);
                        if(draftTest){
                            endAuction=false;
                            break;
                        }
                    }

                    callback(null,endAuction, testOwner);
                },
                function(endAuction, testOwner, callback){
                    //  4 - if continue get the next man up and update the gvars
                    //      else end the auction

                    if(endAuction){
                        //end the draft section
                        Gvar.find().exec(function(err, gvars) {
                            if (err) {
                                console.log(err);
                            } else {
                                var newGvar=gvars[0];
                                newGvar.drafter=null;
                                newGvar.upNext=null;
                                newGvar.bidShow=false;
                                newGvar.auctionDraft=false;
                                newGvar.timerShow=false;
                                newGvar.headerMsg='Auction Draft has Ended';
                                newGvar.drafterName='';
                                newGvar.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('end the auction draft');
                                        stopAllDraftTimer();
                                        io.emit('updateGvar', gvar);
                                    }
                                });
                            }
                        });
                    }
                    else{
                        async.waterfall([
                                function (callback) {
                                    //1 - get the next available player and pass
                                    Player.find({available: true}).sort('absRank').limit(1).exec(function (err, player) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var upNext = player[0]._id;
                                            callback(null, upNext);
                                        }
                                    });
                                },
                                function (upNext, callback) {
                                    //2 - set the upNext, next drafter, next drafter name, save gvar
                                    Gvar.find().exec(function(err, gvars) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var newGvar=gvars[0];
                                            newGvar.drafterName=testOwner.name;
                                            newGvar.drafter=newGvar.pickOrder[newGvar.draftPosition];
                                            newGvar.nomShow=true;
                                            newGvar.upNext=upNext;

                                            newGvar.save(function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    callback(null,upNext);
                                                }
                                            });
                                        }
                                    });
                                },
                                function (upNext, callback) {
                                    //3 - emit update gvar, set the timer
                                    io.emit('updateGvar', gvar);
                                    allDraftTimer();
                                    callback(null, 'finish');
                                }
                            ],
                            function (error, success) {
                                console.log('iterated draft');
                            });
                    }
                }
            ],
            function(error, success){
                console.log('iterated draft');
            });
    }



    function checkAuctionOwner(testOwner){
        var x, salary= 0, numPlayer=0;
        for(x=0;x<testOwner.keepRoster.length;x++){
            //console.log(myOwner.keepRoster[x]);
            salary+=testOwner.keepRoster[x].price;
            numPlayer++;
        }
        salary=Math.ceil(salary);
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
    }


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
    }

    function movePlayers(owner, callback){
        var x=0;
        for(x=0;x<owner.keepRoster.length;x++){
            owner.previousRoster.push(owner.keepRoster[x]);
        }

        for(x=0;x<owner.bidRoster.length;x++){
            owner.previousRoster.push(owner.bidRoster[x]);
        }

        //console.log(owner);
        owner.keepRoster.splice(0,owner.keepRoster.length);
        owner.bidRoster.splice(0,owner.bidRoster.length);
        owner.save();
        callback();
    }

    function changePrices(){
        Player.find().exec(function(err, players){
            if(err){
                console.log(err);
            } else{
                //console.log(players);
                async.eachSeries(players,newPlayerPrices, function(){
                    console.log('finished');
                })
            }
        });
    }

    function newPlayerPrices(player, callback){
        //console.log(player.price);
        player.price=Math.round(player.price*1.1*10)/10;
        player.yearsOwned=player.yearsOwned+1;
        player.rookie=false;
        //console.log(player.price);
        player.save();
        callback();
    }


    function updateRank(playerObj, callback){
        Player.findOne({name:playerObj.name, position:playerObj.position}).exec(function(err, player){
            if(err){
                console.log(err);
            } else{
                if(player){
                    player.absRank=playerObj.absRank;
                    player.posRank=playerObj.posRank;
                    player.team=playerObj.team;
                    player.save();
                    console.log(player);
                }
                else{
                    var player = new Player();
                    player.position=playerObj.position;
                    player.absRank=playerObj.absRank;
                    player.posRank=playerObj.posRank;
                    player.uploaded=playerObj.uploaded;
                    player.toUpload=playerObj.toUpload;
                    player.rookie=playerObj.rookie;
                    player.price=playerObj.price;
                    player.yearsOwned=playerObj.yearsOwned;
                    //player.owner=playerObj.owner;
                    player.user=playerObj.user;
                    player.team=playerObj.team;
                    player.name=playerObj.name;
                    player.save();
                    //player.user = req.user;
                    //need to add in an owner

                    //need to first find players that are not in there and then mark them with rank 999
                    console.log('add a new player');
                    console.log(player);

                }
                callback();
            }
        });
    }

    function markOldPlayer(playerArray, player, callback){
        console.log('player to check');
        console.log(player.name);
        var i,
            changeRank=true;

        for(i=0;i<playerArray.length;i++){
            if(playerArray[i].name==player.name && playerArray[i].position==player.position){
                changeRank=false;
                break;
            }
        }
        if(changeRank){
            player.absRank=999;
            player.posRank=999;
            console.log('didnt see');
            player.save();
        }
        callback();
    }

    function playersWithNoOwner(player, callback){
        console.log(player.name + ' - ' + player.price + ' - ' + player.owner);
        player.price=0;
        player.yearsOwned=0;
        player.save();

        callback();
    }

    function reAssociatePlayers(owner, callback){
        var previousRoster = owner.previousRoster;

        async.eachSeries(previousRoster, associatePreviousPlayer.bind(associatePreviousPlayer, owner._id), function(){
            console.log('finished');
        });
        callback();
    }

    function associatePreviousPlayer(ownerId, playerId, callback){
        Player.findById(playerId).exec(function(err, player) {
            if (err) {
                console.log(err);
            } else {
                player.owner=ownerId;
                player.save();
                callback();
            }
        });
    }

    function playersRostered(player, callback){
        console.log(player.name + ' - ' + player.price + ' - ' + player.owner);
        player.price=1.1;
        player.yearsOwned=1;
        player.save();

        callback();
    }


    //{"team":{},"name":"Eddie Lacy","position":"RB","absRank":101,"posRank":101,"uploaded":false,"toUpload":true,"rookie":false,"price":0,"yearsOwned":0,"owner":null}

    /*^^^^^^^^^^^^^^^^^^^
      ^^^^^^^^^^^^^^^^^^*/


    io.on('connection', function(socket){
        socket.broadcast.emit('user connected');

        /********
         * ADMIN CODE FOR STARTING A NEW SEASON
         *******/

        socket.on('startNewSeason',function(){
            async.waterfall([
                    function(callback){
                        changePrices();
                        var testVar1='finish1';
                        callback(null,testVar1);
                    },
                    function(testVar1, callback){
                        console.log(testVar1);
                        Owner.find().exec(function(err, owners){
                            if(err){
                                console.log(err);
                            } else{
                                //console.log(players);
                                async.eachSeries(owners,movePlayers, function(){
                                    console.log('finished');
                                })
                            }
                        });
                        callback(null, 'finish');
                    }
                ],
                function(error, success){
                    console.log(success);
                });
        });

        //db.players.find({owner:null, price:{$gt:0}})
        //db.players.find({owner:{$ne:null}, price:0})

        socket.on('teamQuality', function(){
            Owner.find().exec(function(err, owners){
                if(err){
                    console.log(err);
                } else{
                    //console.log(players);
                    async.eachSeries(owners,reAssociatePlayers, function(){
                        console.log('finished');
                    })
                }
            });
        });

        socket.on('currentlyRostered', function(){
            Player.find({owner: {$ne:null}, price:0}).exec(function(err, players){
                if(err){
                    console.log(err);
                } else{
                    //console.log(players);
                    async.eachSeries(players,playersRostered, function(){
                        console.log('finished');
                    })
                }
            });
        });

        socket.on('oldPlayers', function(){
            Player.find({owner: null, price:{$gt:0}}).exec(function(err, players){
            //Player.find({owner: null, yearsOwned:{$gt:0}}).exec(function(err, players){
                if(err){
                    console.log(err);
                } else{
                    //console.log(players);
                    async.eachSeries(players,playersWithNoOwner, function(){
                        console.log('finished');
                    })
                }
            });
        });

        socket.on('updateRanks', function(playerArray){
            async.eachSeries(playerArray,updateRank, function(){
                console.log('finished');
            })
        });

        socket.on('markOldPlayers', function(playerArray){
            Player.find().exec(function(err, players){
                if(err){
                    console.log(err);
                } else{
                    //console.log(players);
                    async.eachSeries(players, markOldPlayer.bind(markOldPlayer, playerArray), function(){
                        console.log('finished');
                    })
                }
            });
        });

        socket.on('roundPrices', function(){
           Player.find().exec(function(err, players){
              if(err){
                  console.log(err);
              } else{
                //console.log(players);
                  async.eachSeries(players,roundPlayerPrices, function(){
                      console.log('finished');
                  })
              }
           });
        });



        /****
         * ASYNC
         ****/
        socket.on('testAsync', function(ownerId){
            console.log('test async');
            console.log(ownerId);
            var testVar1;

            async.waterfall([
                function(callback){
                    console.log('this is function 1');
                    Owner.find({'myUser':ownerId}).exec(function(err, owners) {
                            if (err) {
                                    console.log(err);
                            } else {
                                console.log(owners);
                                testVar1=owners;
                                callback(null,testVar1);
                            }
                        });
                    },
                function(testVar1, callback){
                    console.log(testVar1[0].previousRoster);

                    async.eachSeries(testVar1[0].previousRoster, seriesFxn, function(){
                        var testVar2 = 'a';
                        console.log('finish with all of the players')
                        callback(null, testVar2);
                    });

                },
                function(testVar2, callback){
                        console.log(testVar2);
                        callback(null, 'finish');
                    }

            ],
            function(error, success){
                    console.log(success);
            });
        });

        
        socket.on('endRfa', function(){
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
            }).then(function(){
                Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                    if (err) {
                        console.log(err);
                    } else {
                        io.emit('updateBids', bids);
                        console.log('send out bids');
                    }
                }).then(function(){
                    Hist.find().sort('-created').exec(function(err, allHist) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('history modded');
                            //console.log(allHist);
                            io.emit('updateHistory', allHist);
                        }
                    });
                });
            });
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

        socket.on('resetGvars', function(){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.editTime=true;
                    gvar.bidShow=false;
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
                }).then(function(){
                    allDraftTimer();
                });
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
                        gvar.draftPosition=-1;
                        gvar.drafter=gvar.pickOrder[0]._id;
                        gvar.drafterName=gvar.pickOrder[0].name;
                        gvar.upNext=upNext;
                        gvar.headerMsg='Auction Draft';

                        gvar.save();
                        //io.emit('updateGvar', gvar);
                    }
                }).then(function(){
                    iterateDraft();
                    //allDraftTimer();
                });
            })
        });
        socket.on('startSnake', function(){
            async.waterfall([
                function(callback){
                    Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            var upNext=player[0]._id;
                            console.log(player);
                            callback(null,upNext);
                        }
                    });
                },
                function(upNext, callback){
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
                            gvar.draftPosition=-1;
                            gvar.drafter=gvar.pickOrder[0]._id;
                            gvar.drafterName=gvar.pickOrder[0].name;
                            gvar.upNext=upNext;
                            gvar.headerMsg='Snake Draft';
                            gvar.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,gvar);
                                }
                            });
                        }
                    });
                },
                function(gvar, callback){
                    iterateDraft();
                    callback(null, 'finish');
                }
            ],
            function(error, success){
                console.log('success start snake');
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
            var playerId=input.playerId,
                ownerId=input.ownerId,
                price=input.price,
                bidId=input.bidId;

            //waterfall
            //1 - grab the global var and pass
            //2 - mod the player and save
            //3 - mod the owner
            //4 - remove the bid
            //5 - create a new history
            //6 - send out new players, owners, bids, history
            //7 - iterate draft

            async.waterfall([
                function(callback){
                    console.log('stopping time first');
                    stopAllDraftTimer();
                    callback(null,gvar);
                },
                function(gvar, callback){
                    Player.findById(playerId).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            player.price=price;
                            player.owner=ownerId;
                            player.available=false;
                            player.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,player);
                                }
                            });
                        }
                    });
                },
                function(player, callback){
                    //emit new bids to update everything
                    Player.find().populate('owner', 'name').exec(function(err, players) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updatePlayers', players);
                            console.log('updated player');
                            callback(null,players);
                        }
                    });
                },
                function(players, callback){
                    Owner.findById(ownerId).exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {
                            owner.keepRoster.push(playerId);
                            owner.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,owner);
                                }
                            });
                        }
                    });
                },
                function(owner, callback){
                    //emit new bids to update everything
                    Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                        if (err) {
                            console.log(err);
                        } else {
                            io.emit('updateOwners', owners);
                            console.log('updated owner');
                            //console.log(owners);
                            callback(null,owners);
                        }
                    });
                },
                function(testVar1, callback){
                    modHistory(ownerId, price, playerId);
                    if(bidId!=null){
                        modDraftBid(bidId);
                    }
                    iterateDraft();
                    callback(null, 'finish');
                }
            ],
            function(error, success){
                console.log(success);
            });
        });


        socket.on('endRfaMatch', function(){
            var x;

            Bid.find().exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    async.eachSeries(bids, executeRfas, function(){
                        console.log('executed all rfas')
                    });
                }
            });
        });


        socket.on('nominate', function(input){
            //need the owner and the player Ids
            //create a bid
            //send it out
            //start the timer
            Gvar.find().exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('stopping time first');
                    stopAllDraftTimer();
                }
            }).then(function(){
                nominate(input);
            });

        });

        socket.on('executeBid', function(){
            Bid.find().exec(function(err, bids) {
                if (err) {
                    console.log(err);
                } else {
                    var bid=bids[0];
                    modDraftPlayerBlah(bid.player,bid.price,bid.owner, bid._id, true);
                    //modDraftOwner(bid.player,bid.owner);
                    //modHistory(bid.owner, bid.price, bid.player);
                    //modDraftBid(bid._id);
                    //iterateDraft();
                }
            });
        });


        /**********
         * MOD RFA BID
         **********/
        socket.on('modRfaBid', function(input){

            //waterfall
            //1 - make a logbid
            //2 - grab owner and calculate salary and # of players to validate
                //make function for checking if an owner can take on a bid
                    //roster check = roster space + bids out (make mongo function)
                    //salary check = salary + cost of all bids
                //pass the true/false
            //3 - grab real bid and see if it's higher
                //if they are both true
                    //waterfall
                        //1 - stop timer
                        //2 - make a new logbid and pass
                        //3 - grab the real bid
                            //if it is the highest bid, change it
                            //if not then don't
                            //save real bid
                        //4 - emit the bids
                        //5 - start timer
                //if comes back false
                    //send error msg back

            var bidId=input.bid._id,
                newPrice=input.bid.myBid,
                ownerId=input.owner,
                ownerTest;

            async.waterfall([
                function(callback){
                    //create a new bidLog
                    Bid.findById(bidId).exec(function(err, oldBid) {
                        var logbid = new Bidlog();
                        logbid.name = oldBid.name;
                        logbid.user = oldBid.user;
                        logbid.price = newPrice;
                        logbid.owner = ownerId;
                        logbid.player = oldBid.player;
                        logbid.origOwner = oldBid.origOwner;
                        logbid.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(null,oldBid.price, logbid.player);
                            }
                        });
                    });
                },
                function(oldPrice, playerId, callback){
                    //2 - grab owner and calculate salary and # of players to validate
                    //make function for checking if an owner can take on a bid
                    //roster check = roster space + bids out (make mongo function)
                    //salary check = salary + cost of all bids
                    //pass the true/false

                    Owner.findById(ownerId).populate('keepRoster', 'price').exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {
                            callback(null, owner, oldPrice, playerId);
                        }
                    });
                },
                function(owner, oldPrice, playerId, callback){
                    //salary check = salary + cost of all bids
                    var x,
                        salary= newPrice,
                        numPlayer=owner.keepRoster.length+ 1;    //add 1 for the current bid

                    async.waterfall([
                        function(callback){
                            //find all of the bids that you currently own
                            //pass it
                            for(x=0;x<owner.keepRoster.length;x++){
                                salary+=owner.keepRoster[x].price;
                            }

                            Bid.find({owner:owner._id}).exec(function(err, bids) {
                                callback(null,bids);
                            });
                        },
                        function(bids, callback){
                            //then see if any of them are the player that you are currently bid on
                            numPlayer+=bids.length;
                            //subtract 1 if you are just reupping a bid and remove the old price
                            for(x=0;x<bids.length;x++){
                                salary+=bids[x].price;
                                if(bids[x].player==playerId){
                                    numPlayer--;
                                    salary-=bids[x].price;
                                }
                            }
                            if(numPlayer<=maxPlayers && salary<=salaryCap){
                                ownerTest=true;
                            }
                            else{
                                ownerTest=false;
                            }
                            callback(null,'test done');
                        }
                    ],function(error, success){
                        callback(null, ownerTest, oldPrice, playerId);
                    });
                },
                function(ownerTest, oldPrice, playerId, callback){
                    //3 - test owner and price and send back error message
                        //find the highest logbid
                    Bidlog.find({player:playerId}).sort({price: -1}).limit(1).exec(function(err, highBid) {
                        if (err) {
                            console.log(err);
                        } else {
                            callback(null, highBid[0], ownerTest, oldPrice);
                        }
                    });
                },
                function(highBid, ownerTest, oldPrice, callback){
                    //4 - update the bid with the highest value bid and send out
                    Bid.findById(bidId).exec(function(err, bid) {
                        bid.owner = highBid.owner;
                        bid.price = highBid.price;
                        bid.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                //reset the timer if the tests pass
                                if(!ownerTest || (newPrice<oldPrice)){
                                    //send back error message
                                    stopAllDraftTimer();
                                    allDraftTimer();
                                }

                                //emit the bids
                                sendOutBids();
                                console.log('made new bid for ' + bid.name + ' - ' + bid.price);
                                callback(null,bid);
                            }
                        });
                    });
                }
            ],function(error, success){console.log('bid executed')});
        });


        /***********
         * DUMP ALL PLAYERS AT END OF OFFSEASON AND INITIALIZE RFA BIDS
         ***********/
        socket.on('dumpPlayers', function(){
            //grab all owners and loop through them and pick out players still in previous roster
                //change the price to 0 //change available to true //change owner to null //change yearsowned to 0 //save player
                //empty previous roster array //save owner
                //create a new bid with everyone in the rfa pool

            //eachseries uesrs
                //waterfall
                //1 - eachseries previousRoster
                    //change them
                //2 - empty previousRoster
                //3 - eachseries bidRoster
                    //create new bid

            Owner.find().exec(function(err, owners){
                if(err){
                    console.log(err);
                } else{
                    async.eachSeries(owners, movePastRfsa, function(){
                        console.log('finished');
                    })
                }
            });



        });


        /*****
         ***ASSOCIATE PLAYER PAGE
         *****/

            //SELECT A PLAYER
        socket.on('choosePlayer', function(input){
            async.waterfall([
                function(callback){
                    //get selected owner
                    Owner.findById(input.ownerId).exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {
                            owner.previousRoster.push(input.playerId);
                            console.log('after\n' + owner);
                            owner.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,owner);
                                }
                            });
                        }
                    });
                },
                function(owner, callback){
                    //change the player
                    Player.findById(input.playerId).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            player.yearsOwned=1;
                            player.available=false;
                            player.owner=input.ownerId;
                            console.log(player);
                            player.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,'finish');
                                }
                            });
                        }
                    });
                }
            ],
            function(error, success){
                console.log('success choose player');
            });
        });

        socket.on('unchoosePlayer', function(input){
            async.waterfall([
                function(callback){
                    //get selected owner
                    Owner.findById(input.ownerId).exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {
                            owner.previousRoster.splice(input.playerLoc,1);
                            console.log('after\n' + owner);
                            owner.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,owner);
                                }
                            });
                        }
                    });
                },
                function(owner, callback){
                    //change the player
                    Player.findById(input.playerId).exec(function(err, player) {
                        if (err) {
                            console.log(err);
                        } else {
                            player.yearsOwned=0;
                            player.available=true;
                            player.owner=null;
                            console.log(player);
                            player.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    callback(null,'finish');
                                }
                            });
                        }
                    });
                }
            ],
            function(error, success){
                console.log('success unchoose');
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
}

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
}

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
}

function stopTime(){
    clearInterval(intervalId);
}

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











//var owner,
//    playerId,
//    counter=0,
//    bidPlayer,
//    x, y, z, sampleUser;
//User.find().exec(function(err, users) {
//    if (err) {
//        console.log(err);
//    } else {
//        sampleUser=users[0]._id;
//    }
//}).then(function(){
//    Owner.find().populate('bidRoster', 'price').exec(function(err, owners) {
//        if (err) {
//            console.log(err);
//        } else {
//            for(x=0;x<owners.length;x++){
//                owner=owners[x];
//                console.log(owner.name);
//                for(y=0;y<owner.previousRoster.length;y++){
//                    playerId=owner.previousRoster[y];
//                    //change the player
//                    Player.findById(playerId).exec(function(err, player) {
//                        if (err) {
//                            console.log(err);
//                        } else {
//                            player.available=true;
//                            player.owner=null;
//                            player.yearsOwned=0;
//                            player.price=1;
//                            player.save();
//                            console.log(player.name);
//                        }
//                    }).then(function(){
//                        counter=counter;
//                    });
//                }
//                owner.previousRoster.splice(0,owner.previousRoster.length);
//                owner.save();
//
//                for(z=0;z<owner.bidRoster.length;z++){
//                    counter++;
//                    bidPlayer=owner.bidRoster[z];
//                    //initialize bids
//                    var bidInput={};
//                    bidInput.name='bid_'+bidPlayer._id;
//                    bidInput.user=sampleUser;
//                    //bidInput.price=bidPlayer.price;
//                    bidInput.price=1;
//                    bidInput.player=bidPlayer._id;
//                    bidInput.owner=owner._id;
//                    bidInput.origOwner=owner._id;
//
//                    var bid=new Bid(bidInput);
//                    bid.save(function(err) {
//                        if (err) {
//                            console.log(err);
//                        } else {
//                            console.log(bid);
//                        }
//                    });
//
//                    Player.findById(bidPlayer._id).exec(function(err, biddingPlayer) {
//                        if (err) {
//                            console.log(err);
//                        } else {
//                            biddingPlayer.yearsOwned=0;
//                            biddingPlayer.save();
//                        }
//                    });
//
//
//
//                }
//            }
//        }
//    });
//});
//
//Owner.findById(ownerId).populate('keepRoster', 'price').exec(function(err, owner) {
//    if (err) {
//        console.log(err);
//    } else {
//        myOwner=owner;
//        salary=myOwner.extraMoney;
//        stopAllDraftTimer();
//    }
//}).then(function(){
//    Bid.find().exec(function(err, bids) {
//        if (err) {
//            console.log(err);
//        } else {
//            allBids=bids;
//            //console.log('my Owner\n');
//            //console.log(myOwner);
//        }
//    }).then(function(){
//        //calculate the salary and num players
//        //console.log('all Bids\n');
//        //console.log(allBids);
//        for(x=0;x<myOwner.keepRoster.length;x++){
//            //console.log(myOwner.keepRoster[x]);
//            salary+=myOwner.keepRoster[x].price;
//            numPlayer++;
//        }
//        for(y=0;y<allBids.length;y++){
//            if(allBids[y].owner==ownerId){
//                console.log(allBids[y].player);
//                if(allBids[y]._id==bidId){
//                    console.log('upping my own bid');
//                    //salary+=newPrice;
//                }
//                else{
//                    console.log('not my bid');
//                    console.log(allBids[y].price);
//                    salary+=allBids[y].price;
//                }
//                numPlayer++;
//            }
//        }
//        salary+=newPrice;
//        numPlayer++;
//
//        if(salary<=salaryCap && numPlayer<=maxPlayers) {
//            Bid.findById(bidId).exec(function(err, bid) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    bid.price=newPrice;
//                    bid.owner=ownerId;
//                    bid.save();
//                }
//            }).then(function(){
//                console.log('wicket 4');
//                //emit new bids to update everything
//                Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids2) {
//                    if (err) {
//                        console.log(err);
//                    } else {
//                        console.log('sending message');
//                        console.log(bids2);
//                        io.emit('updateRfa', bids2);
//                    }
//                });
//            });
//        }
//        else{
//            console.log('validation failed')
//        }
//    }).then(function(){
//        //iterateDraft();
//        allDraftTimer();
//        //###ADD IN SOMETHING TO RESET TIMER
//    });
//});
//var gvar, upNext, endAuction=true, x, drafter, allOwners, testOwner, y, tester, startTimer=true, rgvar;
//Gvar.find().populate('draftOrder', 'name').exec(function(err, gvars) {
//    if (err) {
//        console.log(err);
//    } else {
//        gvar=gvars[0];
//    }
//}).then(function(){
//    if(gvar.rookieDraft){
//        console.log('rookie');
//        gvar.draftPosition++;
//        if(gvar.draftPosition<gvar.draftOrder.length){
//            //get upnext and then new thing
//            //send
//            Player.find({rookie: true, available: true}).sort('absRank').limit(1).exec(function(err, player) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    upNext=player[0]._id;
//                    console.log(player);
//                }
//            }).then(function(){
//                gvar.drafter=gvar.draftOrder[gvar.draftPosition]._id;
//                gvar.drafterName=gvar.draftOrder[gvar.draftPosition].name;
//                gvar.upNext=upNext;
//                gvar.save();
//                io.emit('updateGvar', gvar);
//            }).then(function(){
//                allDraftTimer();
//            });
//        }
//        else{
//            //end it
//            stopAllDraftTimer();
//            gvar.drafter=null;
//            gvar.upNext=null;
//            gvar.drafterName='';
//            gvar.timerShow=false;
//            gvar.headerMsg='Rookie Draft has Ended';
//            gvar.rookieDraft=false;
//            gvar.save();
//            io.emit('updateGvar', gvar);
//
//            console.log('end the rookie draft');
//        }
//    }
//    else if(gvar.auctionDraft){
//        console.log('auction');
//
//        Owner.find().populate('keepRoster', 'price').exec(function(err, owners) {
//            allOwners=owners;
//        }).then(function(){
//            console.log(gvar.pickOrder);
//            console.log(allOwners);
//            for (x=0;x<gvar.pickOrder.length;x++){
//                gvar.draftPosition++;
//                if(gvar.draftPosition>=gvar.pickOrder.length){
//                    gvar.draftPosition=0;
//                }
//                drafter=String(gvar.pickOrder[gvar.draftPosition]);
//                console.log(allOwners.length);
//                for(y=0;y<allOwners.length;y++){
//                    console.log('"' + allOwners[y]._id + '"');
//                    console.log(typeof String(allOwners[y]._id));
//                    console.log('"' + drafter + '"');
//                    console.log(typeof String(drafter));
//                    if(String(allOwners[y]._id)==drafter){
//                        console.log('found');
//                        testOwner=allOwners[y];
//                        break;
//                    }
//                    else{console.log('not');}
//                }
//                console.log(testOwner);
//                console.log('going through the list');
//                console.log(testOwner.name);
//                tester=checkAuctionOwner(testOwner);
//
//                if(tester){
//                    Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
//                        if (err) {
//                            console.log(err);
//                        } else {
//                            upNext=player[0]._id;
//                            console.log(player);
//                        }
//                    }).then(function(){
//                        gvar.drafterName=testOwner.name;
//                        gvar.drafter=gvar.pickOrder[gvar.draftPosition];
//                        gvar.nomShow=true;
//                        gvar.upNext=upNext;
//                        gvar.save();
//                        io.emit('updateGvar', gvar);
//                    }).then(function(){
//                        allDraftTimer();
//                    });
//                    endAuction=false;
//                    break;
//                }
//            }
//            if(endAuction){
//                //end it
//                stopAllDraftTimer();
//                gvar.drafter=null;
//                gvar.upNext=null;
//                gvar.bidShow=false;
//                gvar.auctionDraft=false;
//                gvar.timerShow=false;
//                gvar.headerMsg='Auction Draft has Ended';
//                gvar.drafterName='';
//                gvar.save();
//                io.emit('updateGvar', gvar);
//
//                console.log('end the auction draft');
//            }
//
//        }).then(function(){
//            startTimer=false;
//        });
//    }
//    else if(gvar.snakeDraft){
//        console.log('snake');
//
//        Owner.find().populate('keepRoster', 'price').exec(function(err, owners) {
//            allOwners=owners;
//        }).then(function(){
//            console.log(gvar.pickOrder);
//            console.log(allOwners);
//            for (x=0;x<gvar.pickOrder.length+1;x++){
//                gvar.draftPosition++;
//                if(gvar.draftPosition>=gvar.pickOrder.length){
//                    gvar.draftPosition=0;
//                }
//                drafter=String(gvar.pickOrder[gvar.draftPosition]);
//                console.log(allOwners.length);
//                for(y=0;y<allOwners.length;y++){
//                    //console.log('"' + allOwners[y]._id + '"');
//                    //console.log(typeof String(allOwners[y]._id));
//                    //console.log('"' + drafter + '"');
//                    //console.log(typeof String(drafter));
//                    if(String(allOwners[y]._id)==drafter){
//                        //console.log('found');
//                        testOwner=allOwners[y];
//                        break;
//                    }
//                    //else{console.log('not');}
//                }
//                //console.log(testOwner);
//                console.log('going through the list');
//                console.log(testOwner.name);
//                console.log(testOwner.keepRoster.length+1);
//
//                if((testOwner.keepRoster.length)<maxPlayers){
//                    Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
//                        if (err) {
//                            console.log(err);
//                        } else {
//                            upNext=player[0]._id;
//                            console.log(player);
//                        }
//                    }).then(function(){
//                        gvar.drafterName=testOwner.name;
//                        gvar.drafter=gvar.pickOrder[gvar.draftPosition];
//                        gvar.nomShow=false;
//                        gvar.upNext=upNext;
//                        gvar.save();
//                        io.emit('updateGvar', gvar);
//                    }).then(function(){
//                        allDraftTimer();
//                    });
//                    endAuction=false;
//                    break;
//                }
//            }
//            if(endAuction){
//                //end it
//                stopAllDraftTimer();
//                gvar.drafter=null;
//                gvar.upNext=null;
//                gvar.bidShow=false;
//                gvar.auctionDraft=false;
//                gvar.timerShow=false;
//                gvar.headerMsg='The Draft has Ended. Good Luck!';
//                gvar.drafterName='';
//                gvar.save();
//                io.emit('updateGvar', gvar);
//
//                console.log('end the draft has ended');
//            }
//
//        }).then(function(){
//            startTimer=false;
//        });
//    }
//});
//var bid=new Bid(input);
//bid.save(function(err) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(bid);
//    }
//});
//
//Gvar.find().exec(function(err, gvars) {
//    if (err) {
//        console.log(err);
//    } else {
//        var gvar=gvars[0];
//        gvar.nomShow=false;
//
//        gvar.save();
//        io.emit('updateGvar', gvar);
//    }
//}).then(function(){
//    Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
//        if (err) {
//            console.log(err);
//        } else {
//            io.emit('updateBids', bids);
//            console.log('updated bid');
//        }
//    }).then(function(){
//        allDraftTimer();
//    });
//});
//Gvar.find().exec(function(err, bids) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log('stopping time first');
//        stopAllDraftTimer();
//    }
//}).then(function(){
//    //mo
//    Player.findById(playerId).exec(function(err, player) {
//        if (err) {
//            console.log(err);
//        } else {
//            player.price=price;
//            player.owner=ownerId;
//            player.available=false;
//            player.save();
//        }
//    }).then(function(){
//        //emit new bids to update everything
//        Player.find().populate('owner', 'name').exec(function(err, players) {
//            if (err) {
//                console.log(err);
//            } else {
//                io.emit('updatePlayers', players);
//                console.log('updated player');
//            }
//        }).then(function(){
//            Owner.findById(ownerId).exec(function(err, owner) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    owner.keepRoster.push(playerId);
//                    owner.save();
//                }
//            }).then(function(){
//                //emit new bids to update everything
//                Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
//                    if (err) {
//                        console.log(err);
//                    } else {
//                        io.emit('updateOwners', owners);
//                        console.log('updated owner');
//                        //console.log(owners);
//                    }
//                }).then(function(){
//                    modHistory(ownerId, price, playerId);
//                    if(bidId!=null){
//                        modDraftBid(bidId);
//                    }
//                    iterateDraft();
//                });
//            });
//        });
//    });
//});
//Player.find({available: true}).sort('absRank').limit(1).exec(function(err, player) {
//    if (err) {
//        console.log(err);
//    } else {
//        upNext=player[0]._id;
//        console.log(player);
//    }
//}).then(function(){
//    Gvar.find().populate('pickOrder', 'name').exec(function(err, gvars) {
//        if (err) {
//            console.log(err);
//        } else {
//            var gvar=gvars[0];
//            gvar.bidShow=false;
//            gvar.matchShow=false;
//
//            gvar.timerShow=true;
//            gvar.draftShow=true;
//            gvar.nomShow=false;
//            gvar.rookieDraft=false;
//            gvar.rfaDraft=false;
//            gvar.auctionDraft=false;
//            gvar.snakeDraft=true;
//            gvar.draftPosition=-1;
//            gvar.drafter=gvar.pickOrder[0]._id;
//            gvar.drafterName=gvar.pickOrder[0].name;
//            gvar.upNext=upNext;
//            gvar.headerMsg='Snake Draft';
//
//
//            gvar.save();
//            //io.emit('updateGvar', gvar);
//        }
//    }).then(function(){
//        iterateDraft();
//        //allDraftTimer();
//    });
//});