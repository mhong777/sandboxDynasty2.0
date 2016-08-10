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
        bidInterval, bidCountdown,
        countdown, intervalId;


    function allDraftTimer(){
        //this is the function that sets all the timers and sets what happens when
        //the counters go to 0
        //waterfall
        // 1 - get gvar and pass
        // 2 -
        //      if rfadraft - do nothing
        //      else if rookie or snake
        //          setup the snake timer
        //      else if auction and nominate
        //          setup the nominate timer
        //      else if auction and not nominate
        //          change if timer is 0 then draft

        async.waterfall([
                function(callback){
                    Gvar.find().exec(function(err, gvars) {
                        if (err) {
                            console.log(err);
                        } else {
                            var gvar = gvars[0];
                            callback(null,gvar);
                        }
                    });
                },
                function(gvar, callback){
                    if(gvar.rfaDraft && !gvar.matchShow){
                        console.log('nothing');
                    }
                    else if(gvar.rfaDraft && gvar.matchShow){
                        console.log('nothing');
                    }
                    else if(gvar.rookieDraft || gvar.snakeDraft){
                        pickCountdown = gvar.pickTimer;
                        io.emit('timer', { countdown: pickCountdown });
                        pickInterval = setInterval(function() {
                            if(pickCountdown==0){
                                //draft the next up and iterate
                                clearInterval(pickInterval);
                                console.log('rookie wasnt drafted so autodrafting');
                                executeDraft(gvar.upNext, gvar.drafter, 0, null);
                            }
                            else{
                                pickCountdown--;
                                console.log('pick counter: ' + pickCountdown);
                                io.emit('timer', { countdown: pickCountdown });
                            }
                        }, 1000);
                    }
                    else if(gvar.auctionDraft && gvar.nomShow){
                        console.log('nominate the next player');
                        nomCountdown = gvar.nomTimer;
                        io.emit('timer', { countdown: nomCountdown });
                        console.log('nom counter: ' + nomCountdown);
                        nomInterval = setInterval(function() {
                            if(nomCountdown==0){
                                //nominate the next up
                                clearInterval(nomInterval);
                                console.log('no one was nominated so autodrafted');

                                async.waterfall([
                                        function(callback){
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
                                            var input={};
                                            input.price=1;
                                            input.player=gvar.upNext;
                                            input.owner=gvar.drafter;
                                            input.user=sampleUser;
                                            input.origOwner=null;
                                            input.name='bid for ' + gvar.upNext;
                                            nominate(input);

                                            callback(null,sampleUser);
                                        }
                                    ],
                                    function(error, success){
                                        console.log('autonominated player');
                                    });
                            }
                            else{
                                nomCountdown--;
                                console.log('nom counter: ' + nomCountdown);
                                io.emit('timer', { countdown: nomCountdown });
                            }
                        }, 1000);
                    }
                    else if(gvar.auctionDraft && !gvar.nomShow){
                        console.log('bidding on the next player');
                        bidCountdown = gvar.bidTimer;
                        console.log('bid counter: ' + bidCountdown);
                        io.emit('timer', { countdown: bidCountdown });
                        bidInterval = setInterval(function() {
                            if(bidCountdown==0){
                                //execute the bid
                                clearInterval(bidInterval);
                                console.log('auction for the player ended');
                                //this is where you change it to just execute the draft function
                                Bid.find().exec(function(err, bids) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        var bid=bids[0];
                                        console.log('this is the bid');
                                        console.log(bid.player);

                                        if(bid.player){
                                            executeDraft(bid.player, bid.owner, bid.price, bid._id);
                                        }

                                    }
                                });
                            }
                            else{
                                bidCountdown--;
                                console.log('bid counter: ' + bidCountdown);
                                io.emit('timer', { countdown: bidCountdown });
                            }
                        }, 1000);
                    }
                    callback(null,gvar);
                }
            ],
            function(error, success){
                console.log('success all draft timer');
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
                player.price=0;

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
                    Owner.findById(ownerId).exec(function(err, owner) {
                        if (err) {
                            console.log(err);
                        } else {

                            var x;
                            for(x=0;x<owner.bidRoster.length;x++){
                                //console.log(owner.bidRoster[x] + ' - ' + playerId);
                                if(String(owner.bidRoster[x])==String(playerId)){
                                    //console.log('found');
                                    owner.bidRoster.splice(x,1);
                                    break;
                                }
                            }
                            owner.save(function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var testVar3 = 'change the owner';
                                    callback(null,testVar3);
                                }
                            });
                        }
                    });
                },
                function(testVar3, callback){
                    //change the player
                    Player.findById(playerId).exec(function(err, biddingPlayer) {
                        if (err) {
                            console.log(err);
                        } else {
                            biddingPlayer.yearsOwned=0;
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

    function executeDraft(playerId, ownerId, price, bidId){
        //FUNCTION DRAFTS A PLAYER
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
                    Gvar.find().exec(function(err, gvars) {
                        if (err) {
                            console.log(err);
                        } else {
                            var gvar = gvars[0];
                            callback(null,gvar);
                        }
                    });
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
                    callback(null, 'finish');
                }
            ],
            function(error, success){
                iterateDraft();
                console.log('drafted player');
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

    function executeRfas(bid, callback){
        //looop through and draft all of the players
        async.waterfall([
                function(callback){
                    console.log('executing rfa for ' + bid.player + ' ' + bid.price + ' ' + bid.owner);
                    callback(null,executeDraft(bid.player, bid.owner, bid.price, bid._id));
                }
            ],
            function(error, success){
                console.log('successfully iterated through ' + bid.player);
                callback();
            });
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
                                    input.playerdat=playerId;
                                    input.ownerdat=ownerId;
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
                                            io.emit('updateAdmin');
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

    /*****************
     * Iterate functions
     ****************/

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
        console.log('draft position - ' + gvar.draftPosition);
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
                        gvar.drafter=gvar.draftOrder[gvar.draftPosition]._id;
                        gvar.drafterName=gvar.draftOrder[gvar.draftPosition].name;

                        console.log(gvar.drafter);
                        console.log(gvar.drafterName);

                        gvar.upNext=upNext;
                        gvar.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(null,gvar);
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
                        draftTest = false,
                        x,
                        y,
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

                        if(gvar.auctionDraft){
                            draftTest=checkAuctionOwner(testOwner);
                        }
                        else if(gvar.snakeDraft){
                            if(testOwner.keepRoster.length<maxPlayers){
                                draftTest=true;
                            }
                        }

                        if(draftTest){
                            console.log(testOwner);
                            endAuction=false;
                            //callback(null, endAuction, testOwner);
                            break;
                        }
                    }

                    callback(null, endAuction, testOwner);
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
                                        //inbetweenDraft();
                                        io.emit('updateGvar', newGvar);
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
                                    if(gvar.auctionDraft){
                                        gvar.nomShow=true;
                                    }
                                    else if(gvar.snakeDraft){
                                        if(testOwner.keepRoster.length<maxPlayers){
                                            gvar.nomShow=false;
                                        }
                                    }
                                    gvar.drafterName=testOwner.name;
                                    gvar.drafter=gvar.pickOrder[gvar.draftPosition];

                                    gvar.upNext=upNext;

                                    gvar.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(gvar);
                                            io.emit('updateGvar', gvar);
                                            callback(null,upNext);
                                        }
                                    });
                                },
                                function (upNext, callback) {
                                    //3 - emit update gvar, set the timer
                                    allDraftTimer();
                                    callback(null, 'finish');
                                }
                            ],
                            function (error, success) {
                                console.log('iterated draft continue auction');
                            });
                    }
                }
            ],
            function(error, success){
                console.log('iterated draft outer');
            });
    }

    /****************
     * SUPPORT FUNCTIONS
     ********/

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

    function sendOutBids(){
        Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
            io.emit('updateRfa', bids);
        });
    }

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


    /************
     * ADMIN FUNCTIONS FOR NEW YEAR
     ************/
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


    /*************
     * SOCKET STUFF
     **************/
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

        socket.on('updateDraftPicks', function(input){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    gvar.draftOrder=input.draftOrder.slice(0);
                    gvar.pickOrder=input.pickOrder.slice(0);
                    //gvar.pickOrder=[].concat(input.pickOrder);
                    gvar.save();
                }
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
                    stopAllDraftTimer();
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

        socket.on('updateDraftVars', function(){
            async.waterfall([
                    function(callback){
                        sendOutBids();
                        var testVar1='bids';
                        callback(null,testVar1);
                    },
                    function(testVar1, callback){
                        //emit new bids to update everything
                        Player.find().populate('owner', 'name').exec(function(err, players) {
                            if (err) {
                                console.log(err);
                            } else {
                                io.emit('updatePlayers', players);
                                callback(null,players);
                            }
                        });
                    },
                    function(players, callback){
                        //emit new bids to update everything
                        Owner.find().populate('keepRoster').populate('previousRoster').populate('bidRoster').exec(function(err, owners) {
                            if (err) {
                                console.log(err);
                            } else {
                                io.emit('updateOwners', owners);
                                callback(null,owners);
                            }
                        });
                    },
                    function(owners, callback){
                        //send back all of the executed bids
                        Hist.find().sort('-created').exec(function(err, allHist) {
                            if (err) {
                                console.log(err);
                            } else {
                                io.emit('updateHistory', allHist);
                                var testVar3='add the player to the roster';
                                callback(null, 'finish');
                            }
                        });
                    }
                ],
                function(error, success){
                    console.log('sent out updated vars');
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
                    gvar.editTime=false;
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
                    gvar.editTime=false;
                    gvar.rookieDraft=false;
                    gvar.rfaDraft=true;
                    gvar.auctionDraft=false;
                    gvar.snakeDraft=false;

                    gvar.save();
                    io.emit('updateGvar', gvar);
                }
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
                    gvar.editTime=false;
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
                        gvar.editTime=false;
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
                        gvar.editTime=false;
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
                            gvar.editTime=false;
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

        socket.on('endRfaMatch', function(){
            async.waterfall([
                    function(callback){
                        Bid.find().exec(function(err, bids) {
                            if (err) {
                                console.log(err);
                            } else {
                                async.eachSeries(bids, executeRfas, function(){
                                    console.log('executed all rfas');
                                    callback(null,'executed all rfas');
                                });
                            }
                        });
                    },
                    function(msg, callback){
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
                    function(players,callback){
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
                    function(owners, callback){
                        //emit new bids to update everything
                        Bid.find().populate('owner', 'name').populate('player').populate('origOwner', 'name').exec(function(err, bids) {
                            if (err) {
                                console.log(err);
                            } else {
                                io.emit('updateBids', bids);
                                console.log('send out bids');
                                callback(null, bids);
                            }
                        });
                    },
                    function(bids, callback){
                        //send back all of the executed bids
                        Hist.find().sort('-created').exec(function(err, allHist) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('history modded');
                                io.emit('updateHistory', allHist);
                                callback(null, 'finish');
                            }
                        });
                    }
                ],
                function(error, success){
                    console.log('ending Rfa Match');
                });

        });

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

        socket.on('resetTime', function (data) {
            resetTime();
        });

        socket.on('stopTime', function(){
            stopTime();
        });

        socket.on('updateTimer', function(data){
            Gvar.find().exec(function(err, gvars) {
                if (err) {
                    console.log(err);
                } else {
                    var gvar=gvars[0];
                    if(data.type=='nom'){
                        gvar.nomTimer=data.nomTimer;
                    }
                    else if(data.type=='pick'){
                        gvar.pickTimer=data.pickTimer;
                    }
                    else if(data.type=='bid'){
                        gvar.bidTimer=data.bidTimer;
                    }
                    gvar.save();
                }
            });
        });


        /**********
         * DRAFT STUFF
         **********/
        socket.on('nominate', function(input){
            //need the owner and the player Ids
            //create a bid
            //send it out
            //start the timer
            Gvar.find().exec(function(err, gvars) {
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

        socket.on('draft', function(input){
            var playerId=input.playerId,
                ownerId=input.ownerId,
                price=input.price,
                bidId=input.bidId;
            console.log('stopping time first');
            stopAllDraftTimer();
            executeDraft(playerId, ownerId, price, bidId);
        });

        socket.on('increaseBid', function(input){
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
                                if(newPrice>oldPrice){
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
            ],
            function(error, success){
                console.log('bid executed')
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
        /**************
         ***************/
    });
    
};



