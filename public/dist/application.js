'use strict';
var ApplicationConfiguration = function () {
    var applicationModuleName = 'sandboxdynasty', applicationModuleVendorDependencies = [
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'ngRoute'
      ], registerModule = function (moduleName) {
        angular.module(moduleName, []), angular.module(applicationModuleName).requires.push(moduleName);
      };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies), angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]), angular.element(document).ready(function () {
  '#_=_' === window.location.hash && (window.location.hash = '#!'), angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
}), ApplicationConfiguration.registerModule('bidlogs'), ApplicationConfiguration.registerModule('bids'), ApplicationConfiguration.registerModule('core'), ApplicationConfiguration.registerModule('gvars'), ApplicationConfiguration.registerModule('hists'), ApplicationConfiguration.registerModule('owners'), ApplicationConfiguration.registerModule('players'), ApplicationConfiguration.registerModule('sales'), ApplicationConfiguration.registerModule('users'), angular.module('bidlogs').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('analytic-view', {
      url: '/analytic-view',
      templateUrl: 'modules/bidlogs/views/analytic-view.client.view.html'
    }).state('listBidlogs', {
      url: '/bidlogs',
      templateUrl: 'modules/bidlogs/views/list-bidlogs.client.view.html'
    }).state('createBidlog', {
      url: '/bidlogs/create',
      templateUrl: 'modules/bidlogs/views/create-bidlog.client.view.html'
    }).state('viewBidlog', {
      url: '/bidlogs/:bidlogId',
      templateUrl: 'modules/bidlogs/views/view-bidlog.client.view.html'
    }).state('editBidlog', {
      url: '/bidlogs/:bidlogId/edit',
      templateUrl: 'modules/bidlogs/views/edit-bidlog.client.view.html'
    });
  }
]), angular.module('bidlogs').controller('BidlogsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Bidlogs',
  'Players',
  'Hists',
  '$http',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Bidlogs, Players, Hists, $http, socket) {
    $scope.authentication = Authentication, $scope.thresholds = [
      [
        5,
        10,
        20,
        2
      ],
      [
        5,
        10,
        20,
        2
      ],
      [
        5,
        10,
        20,
        3
      ],
      [
        5,
        10,
        20,
        1
      ]
    ], $scope.bidAmountThreshold = 1, $scope.bidThreshold = 1, $scope.amounts = [
      [
        [],
        [],
        [],
        []
      ],
      [
        [],
        [],
        [],
        []
      ],
      [
        [],
        [],
        [],
        []
      ],
      [
        [],
        [],
        [],
        []
      ]
    ], $scope.avgs = [
      [
        0,
        0,
        0,
        0
      ],
      [
        0,
        0,
        0,
        0
      ],
      [
        0,
        0,
        0,
        0
      ],
      [
        0,
        0,
        0,
        0
      ]
    ], $scope.create = function () {
      var bidlog = new Bidlogs({ name: this.name });
      bidlog.$save(function (response) {
        $location.path('bidlogs/' + response._id), $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.remove = function (bidlog) {
      if (bidlog) {
        bidlog.$remove();
        for (var i in $scope.bidlogs)
          $scope.bidlogs[i] === bidlog && $scope.bidlogs.splice(i, 1);
      } else
        $scope.bidlog.$remove(function () {
          $location.path('bidlogs');
        });
    }, $scope.update = function () {
      var bidlog = $scope.bidlog;
      bidlog.$update(function () {
        $location.path('bidlogs/' + bidlog._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.bidlogs = Bidlogs.query();
    }, $scope.findOne = function () {
      $scope.bidlog = Bidlogs.get({ bidlogId: $stateParams.bidlogId });
    }, $scope.initialize = function () {
      $http.get('/gvars').success(function (data, status) {
        $scope.gvar = data[0];
      }).then(function () {
        $http.get('/bids').success(function (data, status) {
          $scope.bids = data;
        }).then(function () {
          $http.get('/ownersAndPlayers').success(function (data, status) {
            $scope.owners = data;
          }).then(function () {
            $http.get('/bidlogs').success(function (data, status) {
              $scope.bidlogs = data;
            }).then(function () {
              $http.get('/hists').success(function (data, status) {
                $scope.hists = data;
              }).then(function () {
                $scope.fillData();
              });
            });
          });
        });
      });
    }, $scope.fillData = function () {
      var x, y, pos, i, rnk, sum, zArray = [
          0,
          0,
          0,
          0
        ];
      for (x = 0; x < $scope.owners.length; x++) {
        for ($scope.owners[x].positions = new Array(4), $scope.owners[x].bids = new Array(4), $scope.owners[x].cost = new Array(4), $scope.owners[x].won = new Array(4), $scope.owners[x].spent = new Array(4), $scope.owners[x].salary = 0, $scope.owners[x].numPlayers = $scope.owners[x].keepRoster.length, $scope.owners[x].show = !0, i = 0; 4 > i; i++)
          $scope.owners[x].positions[i] = zArray.slice(0), $scope.owners[x].bids[i] = zArray.slice(0), $scope.owners[x].cost[i] = zArray.slice(0), $scope.owners[x].won[i] = zArray.slice(0), $scope.owners[x].spent[i] = zArray.slice(0);
        for (y = 0; y < $scope.owners[x].keepRoster.length; y++)
          'QB' == $scope.owners[x].keepRoster[y].position ? pos = 0 : 'RB' == $scope.owners[x].keepRoster[y].position ? pos = 1 : 'WR' == $scope.owners[x].keepRoster[y].position ? pos = 2 : 'TE' == $scope.owners[x].keepRoster[y].position && (pos = 3), rnk = $scope.owners[x].keepRoster[y].posRank <= $scope.thresholds[pos][0] ? 0 : $scope.owners[x].keepRoster[y].posRank <= $scope.thresholds[pos][1] ? 1 : $scope.owners[x].keepRoster[y].posRank <= $scope.thresholds[pos][2] ? 2 : 3, $scope.owners[x].positions[pos][rnk]++, $scope.owners[x].cost[pos][rnk] = (10 * $scope.owners[x].keepRoster[y].price + 10 * $scope.owners[x].cost[pos][rnk]) / 10, $scope.owners[x].salary = (10 * $scope.owners[x].salary + 10 * $scope.owners[x].keepRoster[y].price) / 10;
      }
      for (x = 0; x < $scope.bidlogs.length; x++)
        for (y = 0; y < $scope.owners.length; y++)
          if ($scope.owners[y]._id == $scope.bidlogs[x].owner._id && $scope.bidlogs[x].price >= $scope.bidAmountThreshold) {
            'QB' == $scope.bidlogs[x].player.position ? pos = 0 : 'RB' == $scope.bidlogs[x].player.position ? pos = 1 : 'WR' == $scope.bidlogs[x].player.position ? pos = 2 : 'TE' == $scope.bidlogs[x].player.position && (pos = 3), rnk = $scope.bidlogs[x].player.posRank <= $scope.thresholds[pos][0] ? 0 : $scope.bidlogs[x].player.posRank <= $scope.thresholds[pos][1] ? 1 : $scope.bidlogs[x].player.posRank <= $scope.thresholds[pos][2] ? 2 : 3, $scope.owners[y].bids[pos][rnk]++;
            break;
          }
      for (x = 0; x < $scope.hists.length; x++)
        if ($scope.hists[x].price > 0)
          for ('QB' == $scope.hists[x].playerdat.position ? pos = 0 : 'RB' == $scope.hists[x].playerdat.position ? pos = 1 : 'WR' == $scope.hists[x].playerdat.position ? pos = 2 : 'TE' == $scope.hists[x].playerdat.position && (pos = 3), rnk = $scope.hists[x].playerdat.posRank <= $scope.thresholds[pos][0] ? 0 : $scope.hists[x].playerdat.posRank <= $scope.thresholds[pos][1] ? 1 : $scope.hists[x].playerdat.posRank <= $scope.thresholds[pos][2] ? 2 : 3, $scope.amounts[pos][rnk].push($scope.hists[x].price), y = 0; y < $scope.owners.length; y++)
            if ($scope.owners[y].name == $scope.hists[x].owner) {
              $scope.owners[y].won[pos][rnk]++;
              break;
            }
      for (x = 0; 4 > x; x++)
        for (y = 0; 4 > y; y++) {
          for (sum = 0, i = 0; i < $scope.amounts[x][y].length; i++)
            sum = (10 * $scope.amounts[x][y][i] + 10 * sum) / 10;
          $scope.amounts[x][y].length > 0 && ($scope.avgs[x][y] = Math.round(sum / $scope.amounts[x][y].length * 10) / 10);
        }
      $scope.$digest;
    }, socket.on('updateAdmin', function () {
      $scope.initialize();
    });
  }
]), angular.module('bidlogs').factory('Bidlogs', [
  '$resource',
  function ($resource) {
    return $resource('bidlogs/:bidlogId', { bidlogId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('bids').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('rfa-match', {
      url: '/rfa-match',
      templateUrl: 'modules/bids/views/rfa-match.client.view.html'
    }).state('rfa', {
      url: '/draft',
      templateUrl: 'modules/bids/views/rfa.client.view.html'
    }).state('listBids', {
      url: '/bids',
      templateUrl: 'modules/bids/views/list-bids.client.view.html'
    }).state('createBid', {
      url: '/bids/create',
      templateUrl: 'modules/bids/views/create-bid.client.view.html'
    }).state('viewBid', {
      url: '/bids/:bidId',
      templateUrl: 'modules/bids/views/view-bid.client.view.html'
    }).state('editBid', {
      url: '/bids/:bidId/edit',
      templateUrl: 'modules/bids/views/edit-bid.client.view.html'
    });
  }
]), angular.module('bids').controller('BidsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Bids',
  function ($scope, $stateParams, $location, Authentication, Bids) {
    $scope.authentication = Authentication, $scope.create = function () {
      var bid = new Bids({ name: this.name });
      bid.$save(function (response) {
        $location.path('bids/' + response._id), $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.remove = function (bid) {
      if (bid) {
        bid.$remove();
        for (var i in $scope.bids)
          $scope.bids[i] === bid && $scope.bids.splice(i, 1);
      } else
        $scope.bid.$remove(function () {
          $location.path('bids');
        });
    }, $scope.update = function () {
      var bid = $scope.bid;
      bid.$update(function () {
        $location.path('bids/' + bid._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.bids = Bids.query();
    }, $scope.findOne = function () {
      $scope.bid = Bids.get({ bidId: $stateParams.bidId });
    };
  }
]), angular.module('bids').controller('RfaMatchController', [
  '$scope',
  function ($scope) {
  }
]), angular.module('bids').controller('RfaController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  'Bids',
  'socket',
  'Players',
  '$timeout',
  'Hists',
  function ($scope, $stateParams, $location, Authentication, Owners, $http, Bids, socket, Players, $timeout, Hists) {
    $scope.getOwners = function () {
    }, $scope.onlyNumbers = function (bidAmt) {
      return !(bidAmt % 1 == 0 && bidAmt > 0);
    }, $scope.initialize = function () {
      if (Authentication) {
        $scope.salary = 0, $scope.numPlayers, $scope.mins = '', $scope.secs = '', $scope.sortType = 'absRank', $scope.sortReverse = !1, $scope.searchPlayer = '', $scope.filters = {}, $scope.filters.position = '', $scope.availableString = 'All Players', $scope.filters.available = !0, $scope.availableString = '', $scope.filters.rookie = '', $scope.user = Authentication.user;
        try {
          $scope.user._id;
        } catch (e) {
          $location.path('/signin');
        }
        null == $scope.user._id && $location.path('/signin'), $http.get('/gvars').success(function (data, status) {
          $scope.gvar = data[0];
        }).then(function () {
          $scope.gvar.rookieDraft && ($scope.filters.rookie = !0), $http.get('/bids').success(function (data, status) {
            $scope.bids = data;
          }).then(function () {
            $http.get('/ownersAndPlayers').success(function (data, status) {
              $scope.owners = data;
            }).then(function () {
              $scope.setMetrics();
            });
          }).then(function () {
            $scope.players = Players.query();
          }).then(function () {
            $scope.hists = Hists.query();
          });
        });
      } else
        console.log('need to log in first'), $location.path('/signin');
    }, $scope.setMetrics = function () {
      console.log('setting metrics');
      var x, fxnOut, numPlayer, salary = 0;
      for (x = 0; x < $scope.owners.length; x++)
        salary = 0, fxnOut = $scope.getSalary($scope.owners[x]), salary = fxnOut[0], numPlayer = fxnOut[1], $scope.owners[x].salary = salary, $scope.owners[x].numPlayer = numPlayer, $scope.owners[x].myUser == $scope.user._id && ($scope.salary = salary, $scope.numPlayers = numPlayer, $scope.myOwner = $scope.owners[x], $scope.dispOwner || ($scope.dispOwner = $scope.owners[x]));
      console.log($scope.gvar.salaryCap - $scope.myOwner.salary);
    }, $scope.getSalary = function (owner) {
      var bid, x = 0, salary = 0, numPlayer = 0;
      for (x = 0; x < owner.keepRoster.length; x++)
        salary = (10 * salary + 10 * owner.keepRoster[x].price) / 10, numPlayer++;
      if ($scope.gvar.rfaDraft)
        for (x = 0; x < $scope.bids.length; x++)
          bid = $scope.bids[x], bid.owner._id == owner._id && (salary += bid.price, numPlayer++);
      return [
        Math.ceil(salary),
        numPlayer
      ];
    }, $scope.viewOwner = function (owner) {
      $scope.dispOwner = owner;
    }, $scope.checkAmount = function (price) {
      console.log(price + ' - ' + $scope.salary);
    }, $scope.oneUp = function (bid, price) {
      console.log('show bid going out', bid, price);
      var input = {};
      input.bid = angular.copy(bid), input.bid.myBid = price, input.owner = $scope.myOwner._id, console.log('bid output', input), socket.emit('increaseBid', input);
    }, $scope.submitBid = function (bid) {
      var x, salary = $scope.myOwner.salary, numPlayers = $scope.myOwner.numPlayer;
      if (bid.myBid > bid.price) {
        for (x = 0; x < $scope.bids.length; x++)
          if ($scope.bids[x]._id == bid._id) {
            $scope.bids[x].owner._id == $scope.ownerId && (salary -= $scope.bids[x].price, numPlayers--);
            break;
          }
        if (salary += bid.myBid, numPlayers++, salary <= $scope.gvar.salaryCap + $scope.myOwner.extraMoney && numPlayers <= $scope.gvar.maxPlayers) {
          var input = {};
          input.bid = bid, input.owner = $scope.myOwner._id, socket.emit('increaseBid', input);
        } else
          console.log('cant do that bcz you are either over salary cap or max players');
      } else
        console.log('cant do that bcz you have to bid more than current price');
    }, $scope.matchBid = function (bid) {
      $scope.draft(bid.player._id, bid.price, bid._id);
    }, $scope.draftRookie = function (rookie, playerId, price, bidId) {
      rookie && $scope.draft(playerId, price, bidId);
    }, $scope.draft = function (playerId, price, bidId) {
      var input = {};
      input.playerId = playerId, input.ownerId = $scope.myOwner._id, input.price = price, input.bidId = bidId, socket.emit('draft', input);
    }, $scope.nominate = function (playerId, playerName) {
      var input = {};
      input.price = 1, input.player = playerId, input.owner = $scope.myOwner._id, input.user = $scope.user._id, input.origOwner = null, input.name = 'bid for ' + playerName, socket.emit('nominate', input);
    }, socket.on('updatePlayers', function (input) {
      $scope.players = input, $scope.$digest();
    }), socket.on('updateOwners', function (input) {
      $scope.owners = input, $scope.setMetrics(), $scope.$digest();
    }), socket.on('updateBids', function (input) {
      $scope.bids = input, $scope.$digest();
    }), socket.on('updateHistory', function (input) {
      $scope.hists = input, $scope.$digest();
    }), socket.on('updateRfa', function (input) {
      $scope.bids = input, $scope.setMetrics(), $scope.$digest();
    }), socket.on('updateGvar', function (input) {
      $scope.gvar = input, $scope.gvar.rookieDraft ? $scope.filters.rookie = !0 : $scope.filters.rookie = '', $scope.$digest();
    }), socket.on('timer', function (input) {
      $scope.time = input.countdown, $scope.mins = parseInt(input.countdown / 60), $scope.secs = parseInt(input.countdown % 60), $scope.secs < 10 && ($scope.secs = '0' + $scope.secs), $scope.$digest();
    }), $scope.changeAvailable = function (value) {
      return 1 === value ? ($scope.filters.available = '', void ($scope.availableString = 'All Players')) : 2 === value ? ($scope.filters.available = !0, void ($scope.availableString = 'Free Agents')) : ($scope.filters.available = !1, void ($scope.availableString = 'Currently Owned'));
    }, $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    }, $scope.listFilter = function (position, available, rookie) {
      return function (list) {
        return list.available !== available && '' !== available || list.rookie != rookie && '' !== rookie ? void 0 : list.position.match(position);
      };
    };
    var stopped;
    $scope.countdown = function () {
      stopped = $timeout(function () {
        $scope.counter--, $scope.mins = parseInt($scope.counter / 60), $scope.secs = parseInt($scope.counter % 60), $scope.countdown();
      }, 1000);
    };
  }
]), angular.module('bids').factory('Bids', [
  '$resource',
  function ($resource) {
    return $resource('bids/:bidId', { bidId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/'), $stateProvider.state('rules', {
      url: '/rules',
      templateUrl: 'modules/core/views/rules.client.view.html'
    }).state('home-page', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    }).state('roster', {
      url: '/roster',
      templateUrl: 'modules/owners/views/review-roster.client.view.html'
    }).state('admin-main', {
      url: '/admin-main',
      templateUrl: 'modules/core/views/admin-main.client.view.html'
    });
  }
]), angular.module('core').controller('AdminPgController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http) {
    $scope.resetGvars = function () {
      socket.emit('resetGvars');
    }, $scope.dumpPlayers = function () {
      socket.emit('dumpPlayers');
    }, $scope.startRfaDraft = function () {
      socket.emit('startRfaDraft');
    }, $scope.startRfaMatch = function () {
      socket.emit('startRfaMatch');
    }, $scope.endRfaMatch = function () {
      socket.emit('endRfaMatch');
    }, $scope.inbetweenDraft = function () {
      socket.emit('inbetweenDraft');
    }, $scope.startRookieDraft = function () {
      socket.emit('startRookieDraft');
    }, $scope.endRookieDraft = function () {
      socket.emit('endRookieDraft');
    }, $scope.startAuctionDraft = function () {
      socket.emit('startAuctionDraft');
    }, $scope.endAuctionDraft = function () {
      socket.emit('endAuctionDraft');
    }, $scope.startSnake = function () {
      socket.emit('startSnake');
    }, $scope.iterate = function () {
      socket.emit('iterate');
    }, $scope.executeBid = function () {
      socket.emit('executeBid');
    }, $scope.timeExample = function () {
      socket.emit('timeExample');
    }, $scope.resetTime = function () {
      socket.emit('resetTime');
    }, $scope.stopTime = function () {
      socket.emit('stopTime');
    }, $scope.pauseTimer = function () {
      console.log('blah'), socket.emit('pauseTimer');
    }, $scope.restartTimer = function () {
      socket.emit('restartTimer');
    }, $scope.findOwners = function () {
      $http.get('/gvars').success(function (data, status) {
        $scope.gvar = data[0], $scope.bidTimer = $scope.gvar.bidTimer, $scope.nomTimer = $scope.gvar.nomTimer, $scope.pickTimer = $scope.gvar.pickTimer;
      }).then(function () {
        $scope.owners = Owners.query(), $scope.drafter = {}, $scope.drafter._id = null, $scope.drafter.name = '';
      });
    }, $scope.changeDrafter = function () {
      socket.emit('changeDrafter', $scope.drafter);
    }, $scope.endRfa = function () {
      socket.emit('endRfa');
    }, $scope.updateTimer = function (timerType) {
      var input = {};
      input.bidTimer = $scope.bidTimer, input.pickTimer = $scope.pickTimer, input.nomTimer = $scope.nomTimer, input.type = timerType, socket.emit('updateTimer', input);
    }, $scope.updateVars = function () {
      socket.emit('updateDraftVars');
    };
  }
]), angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  '$http',
  function ($scope, Authentication, Menus, $http) {
    $scope.authentication = Authentication, $scope.isCollapsed = !1, $scope.menu = Menus.getMenu('topbar'), $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    }, $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = !1;
    }), $http.get('/gvars').success(function (data, status) {
      $scope.gvar = data[0], $scope.changeTime = $scope.gvar.editTime;
    });
  }
]), angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    $scope.authentication = Authentication;
  }
]), angular.module('core').service('Menus', [function () {
    this.defaultRoles = ['user'], this.menus = {};
    var shouldRender = function (user) {
      if (!user)
        return this.isPublic;
      for (var userRoleIndex in user.roles)
        for (var roleIndex in this.roles)
          if (this.roles[roleIndex] === user.roles[userRoleIndex])
            return !0;
      return !1;
    };
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId])
          return !0;
        throw new Error('Menu does not exists');
      }
      throw new Error('MenuId was not provided');
    }, this.getMenu = function (menuId) {
      return this.validateMenuExistance(menuId), this.menus[menuId];
    }, this.addMenu = function (menuId, isPublic, roles) {
      return this.menus[menuId] = {
        isPublic: isPublic || !1,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      }, this.menus[menuId];
    }, this.removeMenu = function (menuId) {
      this.validateMenuExistance(menuId), delete this.menus[menuId];
    }, this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      return this.validateMenuExistance(menuId), this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      }), this.menus[menuId];
    }, this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === rootMenuItemURL && this.menus[menuId].items[itemIndex].items.push({
          title: menuItemTitle,
          link: menuItemURL,
          uiRoute: menuItemUIRoute || '/' + menuItemURL,
          isPublic: isPublic || this.menus[menuId].isPublic,
          roles: roles || this.defaultRoles,
          shouldRender: shouldRender
        });
      return this.menus[menuId];
    }, this.removeMenuItem = function (menuId, menuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        this.menus[menuId].items[itemIndex].link === menuItemURL && this.menus[menuId].items.splice(itemIndex, 1);
      return this.menus[menuId];
    }, this.removeSubMenuItem = function (menuId, submenuItemURL) {
      this.validateMenuExistance(menuId);
      for (var itemIndex in this.menus[menuId].items)
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items)
          this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL && this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
      return this.menus[menuId];
    }, this.addMenu('topbar');
  }]), angular.module('gvars').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('draft-order', {
      url: '/draft-order',
      templateUrl: 'modules/gvars/views/draft-order.client.view.html'
    }).state('listGvars', {
      url: '/gvars',
      templateUrl: 'modules/gvars/views/list-gvars.client.view.html'
    }).state('createGvar', {
      url: '/gvars/create',
      templateUrl: 'modules/gvars/views/create-gvar.client.view.html'
    }).state('viewGvar', {
      url: '/gvars/:gvarId',
      templateUrl: 'modules/gvars/views/view-gvar.client.view.html'
    }).state('editGvar', {
      url: '/gvars/:gvarId/edit',
      templateUrl: 'modules/gvars/views/edit-gvar.client.view.html'
    });
  }
]), angular.module('gvars').controller('GvarsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Gvars',
  'Owners',
  'socket',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Gvars, Owners, socket, $http) {
    $scope.authentication = Authentication, $scope.create = function () {
      var gvar = new Gvars({ name: this.name });
      gvar.$save(function (response) {
        $location.path('gvars/' + response._id), $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.remove = function (gvar) {
      if (gvar) {
        gvar.$remove();
        for (var i in $scope.gvars)
          $scope.gvars[i] === gvar && $scope.gvars.splice(i, 1);
      } else
        $scope.gvar.$remove(function () {
          $location.path('gvars');
        });
    }, $scope.update = function () {
      var gvar = $scope.gvar;
      gvar.$update(function () {
        $location.path('gvars/' + gvar._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.gvars = Gvars.query();
    }, $scope.startDraftOrder = function () {
      var x;
      x = $scope.gvar.draftOrder, $scope.draft = x;
    }, $scope.startpickOrder = function () {
      var x;
      x = $scope.gvar.pickOrder, $scope.pickDraft = x;
    }, $scope.addPick = function () {
      $scope.pickDraft.push(null);
    }, $scope.findOne = function () {
      $scope.gvar = Gvars.get({ gvarId: $stateParams.gvarId }), $scope.owners = Owners.query(), $scope.draft, $scope.draftTimer = 0;
    }, $scope.startTimer = function () {
      socket.emit('startTimer', $scope.draftTimer);
    }, $scope.getGvar = function () {
      $http.get('/onlyGvar').success(function (data, status) {
        $scope.gvar = data;
      }).then(function () {
        $scope.owners = Owners.query();
      });
    }, $scope.addDraft = function (listType) {
      'rookie' == listType ? $scope.gvar.draftOrder.push(null) : $scope.gvar.pickOrder.push(null);
    }, $scope.removePick = function (listType, arrayIndex) {
      'rookie' == listType ? $scope.gvar.draftOrder.splice(arrayIndex, 1) : $scope.gvar.pickOrder.splice(arrayIndex, 1);
    }, $scope.changeDraft = function (listType, index, pick) {
      'rookie' == listType ? ($scope.gvar.draftOrder.splice(index, 1, pick), console.log('changed rookie')) : $scope.gvar.pickOrder.splice(index, 1, pick);
    }, $scope.updateDraft = function () {
      var i, input = {}, draftOrder = [], pickOrder = [];
      for (i = 0; i < $scope.gvar.draftOrder.length; i++)
        draftOrder.push($scope.gvar.draftOrder[i]._id);
      for (i = 0; i < $scope.gvar.pickOrder.length; i++)
        pickOrder.push($scope.gvar.pickOrder[i]._id);
      input.draftOrder = draftOrder, input.pickOrder = pickOrder, socket.emit('updateDraftPicks', input);
    };
  }
]), angular.module('gvars').factory('Gvars', [
  '$resource',
  function ($resource) {
    return $resource('gvars/:gvarId', { gvarId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('hists').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('listHists', {
      url: '/hists',
      templateUrl: 'modules/hists/views/list-hists.client.view.html'
    }).state('createHist', {
      url: '/hists/create',
      templateUrl: 'modules/hists/views/create-hist.client.view.html'
    }).state('viewHist', {
      url: '/hists/:histId',
      templateUrl: 'modules/hists/views/view-hist.client.view.html'
    }).state('editHist', {
      url: '/hists/:histId/edit',
      templateUrl: 'modules/hists/views/edit-hist.client.view.html'
    });
  }
]), angular.module('hists').controller('HistsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Hists',
  function ($scope, $stateParams, $location, Authentication, Hists) {
    $scope.authentication = Authentication, $scope.create = function () {
      var hist = new Hists({ name: this.name });
      hist.$save(function (response) {
        $location.path('hists/' + response._id), $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.remove = function (hist) {
      if (hist) {
        hist.$remove();
        for (var i in $scope.hists)
          $scope.hists[i] === hist && $scope.hists.splice(i, 1);
      } else
        $scope.hist.$remove(function () {
          $location.path('hists');
        });
    }, $scope.update = function () {
      var hist = $scope.hist;
      hist.$update(function () {
        $location.path('hists/' + hist._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.hists = Hists.query();
    }, $scope.findOne = function () {
      $scope.hist = Hists.get({ histId: $stateParams.histId });
    };
  }
]), angular.module('hists').factory('Hists', [
  '$resource',
  function ($resource) {
    return $resource('hists/:histId', { histId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('owners').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', 'Owners', 'owners', 'dropdown', '/owners(/create)?'), Menus.addSubMenuItem('topbar', 'owners', 'List Owners', 'owners'), Menus.addSubMenuItem('topbar', 'owners', 'New Owner', 'owners/create');
  }
]), angular.module('owners').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('edit-roster', {
      url: '/edit-roster/:ownerId',
      templateUrl: 'modules/owners/views/edit-roster.client.view.html'
    }).state('review-roster', {
      url: '/review-roster',
      templateUrl: 'modules/owners/views/review-roster.client.view.html'
    }).state('remove-owner', {
      url: '/remove-owner',
      templateUrl: 'modules/owners/views/remove-owner.client.view.html'
    }).state('myplayers', {
      url: '/myplayers/:ownerId',
      templateUrl: 'modules/owners/views/myplayers.client.view.html'
    }).state('assocplayer', {
      url: '/assocplayer',
      templateUrl: 'modules/owners/views/assocplayer.client.view.html'
    }).state('listOwners', {
      url: '/owners',
      templateUrl: 'modules/owners/views/list-owners.client.view.html'
    }).state('createOwner', {
      url: '/owners/create',
      templateUrl: 'modules/owners/views/create-owner.client.view.html'
    }).state('viewOwner', {
      url: '/owners/:ownerId',
      templateUrl: 'modules/owners/views/view-owner.client.view.html'
    }).state('editOwner', {
      url: '/owners/:ownerId/edit',
      templateUrl: 'modules/owners/views/edit-owner.client.view.html'
    }).state('editOwnerName', {
      url: '/owners/:ownerId/edit-name',
      templateUrl: 'modules/owners/views/edit-owner-name.client.view.html'
    }).state('assocPlayers', {
      url: '/assocPlayers',
      templateUrl: 'modules/owners/views/admin-player-owner.html'
    });
  }
]), angular.module('owners').controller('assocPlayerController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http) {
    $scope.authentication = Authentication, $scope.initialze = function () {
      $scope.selectedOwner = {}, $scope.owners = Owners.query();
    }, $scope.initialze(), $scope.getTimer = function () {
      socket.emit('getTime');
    }, $scope.getTimer(), $scope.find = function () {
      $scope.owners = Owners.query(), $scope.players = Players.query(), $scope.selectedOwner = {}, $scope.selectedPlayer = {}, $scope.counter = 0;
    }, $scope.selectOwner = function (owner) {
      $scope.selectedOwner = owner;
    }, $scope.selectPlayer = function (player) {
      $scope.selectedOwner._id && ($scope.input = {}, $scope.input.ownerId = $scope.selectedOwner._id, $scope.input.playerId = player._id, socket.emit('choosePlayer', $scope.input));
    }, socket.on('playerChosen', function (output) {
      $scope.selectedOwner = output.owner, $scope.$digest();
    }), socket.on('timer', function (data) {
      $scope.counter = data.countdown, $scope.$digest();
    }), socket.on('finalMsg', function (data) {
      $scope.msg = data.msg, $scope.$digest();
    }), $scope.startTimer = function () {
      socket.emit('startTimer', 10);
    }, $scope.resetTimer = function () {
      console.log('go reset'), socket.emit('reset');
    };
  }
]), angular.module('owners').controller('EditRosterController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  '$modal',
  function ($scope, $stateParams, $location, Authentication, Owners, $http, $modal) {
    $scope.user = Authentication.user, $scope.timeCheck = !1, $scope.rosterCheck = !1, $scope.getOwner = function () {
      if (null == Authentication.user)
        $location.path('/');
      else {
        var ownerId = $stateParams.ownerId;
        $scope.salary = 0, $scope.rfaSalary = 0, $http.get('/gvars').success(function (data, status) {
          $scope.gvar = data[0], $scope.changeTime = $scope.gvar.editTime;
        }).then(function () {
          $http.get('/editRoster/' + ownerId).success(function (data, status) {
            $scope.owner = data;
          }).then(function () {
            $scope.owner.myUser == $scope.user._id && ($scope.rosterCheck = !0), $scope.setData();
          });
        });
      }
    }, $scope.changeKeeper = function (player, status) {
      if ($scope.rosterCheck && $scope.changeTime) {
        var req = {};
        req.status = status, req.ownerId = $scope.owner._id, req.playerId = player._id, 1 == status ? $scope.salary + player.price <= $scope.gvar.keeperCap && $scope.rfaSalary + player.price <= $scope.gvar.salaryCap ? $http.put('/changeKeeper', req).success(function (data, status) {
          console.log('added ' + player.name), $scope.owner = data;
        }).then(function () {
          console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length), $scope.setData();
        }) : alert('sorry bud, you\'re over the limit') : $http.put('/changeKeeper', req).success(function (data, status) {
          console.log('removed ' + player.name), $scope.owner = data, console.log($scope.owner.previousRoster.length + ' - ' + $scope.owner.keepRoster.length);
        }).then(function () {
          $scope.setData();
        });
      }
    }, $scope.changeBidee = function (player, status) {
      if ($scope.rosterCheck && $scope.changeTime) {
        var req = {};
        req.status = status, req.ownerId = $scope.owner._id, req.playerId = player._id, 1 == status ? $scope.rfaSalary + player.price + $scope.salary <= $scope.gvar.salaryCap + $scope.owner.extraMoney ? (console.log(req), $http.put('/changeBidee', req).success(function (data, status) {
          console.log('changed bidee'), console.log(data), $scope.owner = data;
        }).then(function () {
          $scope.setData();
        })) : alert('sorry bud, you don\'t have enough cash to pay for that') : (console.log(req), $http.put('/changeBidee', req).success(function (data, status) {
          console.log(data), $scope.owner = data;
        }).then(function () {
          console.log('removed bidee'), $scope.setData();
        }));
      }
    }, $scope.setData = function () {
      console.log('setting data');
      var x, salary = 0, rfaSalary = 0;
      for ($scope.owner.keepEligable = [], $scope.owner.bidEligable = [], x = 0; x < $scope.owner.previousRoster.length; x++)
        $scope.owner.previousRoster[x].yearsOwned < 3 ? $scope.owner.keepEligable.push($scope.owner.previousRoster[x]) : $scope.owner.bidEligable.push($scope.owner.previousRoster[x]);
      for (x = 0; x < $scope.owner.keepRoster.length; x++)
        salary += $scope.owner.keepRoster[x].price;
      rfaSalary += $scope.owner.bidRoster.length, $scope.salary = Math.ceil(salary), $scope.rfaSalary = Math.ceil(rfaSalary), $scope.rosterCheck ? $scope.errMsg = !1 : $scope.errMsg = !0, $scope.$digest;
    }, $scope.open = function (myMode) {
      1 == myMode ? $modal.open({
        animation: !0,
        templateUrl: 'modules/owners/views/keeper-modal.client.view.html',
        controller: 'ModalController',
        size: 'lg'
      }) : $modal.open({
        animation: !0,
        templateUrl: 'modules/owners/views/rfa-modal.client.view.html',
        controller: 'ModalController',
        size: 'lg'
      });
    };
  }
]), angular.module('owners').controller('ModalController', [
  '$scope',
  function ($scope) {
  }
]), angular.module('owners').controller('MyplayersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket) {
    $scope.initialze = function () {
      $scope.owner = Owners.get({ ownerId: $stateParams.ownerId }), $scope.players = Players.query();
    }, $scope.initialze(), $scope.assignPlayer = function (player) {
      if (player.available) {
        var input = {};
        input.ownerId = $scope.owner._id, input.playerId = player._id, socket.emit('choosePlayer', input), $scope.owner.previousRoster.push(player), player.available = !1;
      }
    }, $scope.unassignPlayer = function (player) {
      var input = {};
      input.ownerId = $scope.owner._id, input.playerId = player._id;
      for (var x = 0; x < $scope.owner.previousRoster.length; x++)
        if ($scope.owner.previousRoster[x]._id == player._id) {
          $scope.owner.previousRoster.splice(x, 1), input.playerLoc = x;
          break;
        }
      for (x = 0; x < $scope.players.length; x++)
        if ($scope.players[x]._id == player._id) {
          $scope.players[x].available = !0;
          break;
        }
      socket.emit('unchoosePlayer', input);
    }, $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    }, $scope.listFilter = function (position) {
      return function (list) {
        return list.position.match(position);
      };
    };
  }
]), angular.module('owners').controller('OwnersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  'Users',
  function ($scope, $stateParams, $location, Authentication, Owners, $http, Users) {
    $scope.authentication = Authentication, $scope.create = function () {
      var owner = new Owners({ name: this.name });
      owner.$save(function (response) {
        $location.path('owners');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      }), this.name = '';
    }, $scope.remove = function (owner) {
      if (owner) {
        owner.$remove();
        for (var i in $scope.owners)
          $scope.owners[i] === owner && $scope.owners.splice(i, 1);
        $location.path('owners');
      } else
        $scope.owner.$remove(function () {
          $location.path('owners');
        });
    }, $scope.update = function () {
      var owner = $scope.owner;
      $http.put('/owners/' + owner._id, owner).success(function (data, status) {
        console.log('owner data'), console.log(data);
      }).then(function () {
        $location.path('/roster');
      });
    }, $scope.find = function () {
      $scope.owners = Owners.query();
    }, $scope.getUsers = function () {
      $http.get('/allUsers').success(function (data, status) {
        $scope.allUsers = data;
      });
    }, $scope.initializeEditOwner = function () {
      $scope.findOne(), $scope.find(), $scope.getUsers();
    }, $scope.findOne = function () {
      var ownerId = $stateParams.ownerId;
      $http.get('/owners/' + ownerId).success(function (data, status) {
        $scope.owner = data;
      }).then(function () {
        $scope.associateUser = {}, $scope.associateUser._id = $scope.owner.myUser, $scope.oldUser = $scope.owner.myUser;
      });
    }, $scope.changeOwnerUser = function () {
      $scope.owner.myUser = $scope.associateUser._id, $scope.associateUser.ownerId = $scope.owner._id;
    };
  }
]), angular.module('owners').controller('RemoveOwnerController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'Owners',
  function ($scope, $http, $location, Users, Authentication, Owners) {
    $http.get('/allUsers').success(function (data, status) {
      $scope.allUsers = data;
    });
  }
]), angular.module('owners').controller('ReviewRosterController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, $http) {
    function userExists(arr, searchingFor) {
      return arr.some(function (el) {
        return el.lookupValue === searchingFor;
      });
    }
    $scope.getOwners = function () {
      var salary, x = 0;
      $http.get('/gvars').success(function (data, status) {
        $scope.gvar = data[0];
      }).then(function () {
        $http.get('/reviewRoster').success(function (data, status) {
          $scope.owners = data, console.log($scope.owners);
        }).then(function () {
          for (x = 0; x < $scope.owners.length; x++)
            salary = 0, salary = $scope.getSalary($scope.owners[x]), $scope.owners[x].salary = salary;
        });
      });
    }, $scope.initialize = function () {
      null == Authentication.user ? $location.path('/') : ($scope.getOwners(), $scope.salaryCap = 300, $scope.keeperCap = 175);
    }, $scope.goToRoster = function (ownerId) {
      $location.path('edit-roster/' + ownerId);
    }, $scope.getSalary = function (owner) {
      var x, salary = 0;
      for (x = 0; x < owner.keepRoster.length; x++)
        salary = (10 * salary + 10 * owner.keepRoster[x].price) / 10;
      return salary;
    }, $scope.items = [
      {
        name: 'a2',
        fValue1: [{
            lookupId: 1,
            lookupValue: 'a'
          }],
        fValue2: [{
            lookupId: 1,
            lookupValue: '2'
          }]
      },
      {
        name: 'b3',
        fValue1: [{
            lookupId: 1,
            lookupValue: 'b'
          }],
        fValue2: [{
            lookupId: 1,
            lookupValue: '3'
          }]
      },
      {
        name: 'cb3',
        fValue1: [
          {
            lookupId: 1,
            lookupValue: 'c'
          },
          {
            lookupId: 1,
            lookupValue: 'b'
          }
        ],
        fValue2: [{
            lookupId: 1,
            lookupValue: '3'
          }]
      },
      {
        name: 'd1',
        fValue1: [{
            lookupId: 1,
            lookupValue: 'd'
          }],
        fValue2: [{
            lookupId: 1,
            lookupValue: '1'
          }]
      },
      {
        name: 'c4',
        fValue1: [{
            lookupId: 1,
            lookupValue: 'c'
          }],
        fValue2: [{
            lookupId: 1,
            lookupValue: '4'
          }]
      },
      {
        name: 'a3',
        fValue1: [{
            lookupId: 1,
            lookupValue: 'a'
          }],
        fValue2: [{
            lookupId: 1,
            lookupValue: '3'
          }]
      }
    ], $scope.changeAvailable = function (value) {
      return 1 === value ? ($scope.filters.available = '', void ($scope.availableString = 'All Players')) : 2 === value ? ($scope.filters.available = !0, void ($scope.availableString = 'Free Agents')) : ($scope.filters.available = !1, void ($scope.availableString = 'Currently Owned'));
    }, $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    }, $scope.listFilter = function (value1, value2) {
      return function (list) {
        return !userExists(list.fValue1, value1) && '' != $scope.filters.value1 || !userExists(list.fValue2, value2) && '' != $scope.filters.value2 ? void 0 : list;
      };
    }, $scope.filters = {}, $scope.filters.value1 = '', $scope.filters.value2 = '';
  }
]), angular.module('owners').factory('Owners', [
  '$resource',
  function ($resource) {
    return $resource('owners/:ownerId', { ownerId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('owners').factory('socket', function () {
  var socket = io.connect('/');
  return socket;
}), angular.module('players').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', 'Players', 'players', 'dropdown', '/players(/create)?'), Menus.addSubMenuItem('topbar', 'players', 'List Players', 'players'), Menus.addSubMenuItem('topbar', 'players', 'New Player', 'players/create');
  }
]), angular.module('players').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('view-players', {
      url: '/admin-players',
      templateUrl: 'modules/players/views/list-players.client.view.html'
    }).state('batch-upload', {
      url: '/batch-upload',
      templateUrl: 'modules/players/views/batch-upload.client.view.html'
    }).state('listPlayers', {
      url: '/players',
      templateUrl: 'modules/players/views/view-players.client.view.html'
    }).state('createPlayer', {
      url: '/players/create',
      templateUrl: 'modules/players/views/add-player.client.view.html'
    }).state('viewPlayer', {
      url: '/players/:playerId',
      templateUrl: 'modules/players/views/view-player.client.view.html'
    }).state('editPlayer', {
      url: '/players/:playerId/edit',
      templateUrl: 'modules/players/views/edit-player.client.view.html'
    });
  }
]), angular.module('players').controller('PlayersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Players',
  'Owners',
  '$http',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Players, Owners, $http, socket) {
    $scope.authentication = Authentication, console.log($scope.authentication), $scope.teams = [
      {
        name: 'ARI',
        byeWeek: 9
      },
      {
        name: 'ATL',
        byeWeek: 11
      },
      {
        name: 'BAL',
        byeWeek: 8
      },
      {
        name: 'BUF',
        byeWeek: 10
      },
      {
        name: 'CAR',
        byeWeek: 7
      },
      {
        name: 'CHI',
        byeWeek: 9
      },
      {
        name: 'CIN',
        byeWeek: 9
      },
      {
        name: 'CLE',
        byeWeek: 13
      },
      {
        name: 'DAL',
        byeWeek: 7
      },
      {
        name: 'DEN',
        byeWeek: 11
      },
      {
        name: 'DET',
        byeWeek: 10
      },
      {
        name: 'GB',
        byeWeek: 4
      },
      {
        name: 'HOU',
        byeWeek: 9
      },
      {
        name: 'IND',
        byeWeek: 10
      },
      {
        name: 'JAC',
        byeWeek: 5
      },
      {
        name: 'KC',
        byeWeek: 5
      },
      {
        name: 'MIA',
        byeWeek: 8
      },
      {
        name: 'MIN',
        byeWeek: 6
      },
      {
        name: 'NE',
        byeWeek: 9
      },
      {
        name: 'NO',
        byeWeek: 5
      },
      {
        name: 'NYG',
        byeWeek: 8
      },
      {
        name: 'NYJ',
        byeWeek: 11
      },
      {
        name: 'OAK',
        byeWeek: 10
      },
      {
        name: 'PHI',
        byeWeek: 4
      },
      {
        name: 'PIT',
        byeWeek: 8
      },
      {
        name: 'SD',
        byeWeek: 11
      },
      {
        name: 'SEA',
        byeWeek: 5
      },
      {
        name: 'SF',
        byeWeek: 8
      },
      {
        name: 'LA',
        byeWeek: 8
      },
      {
        name: 'TB',
        byeWeek: 6
      },
      {
        name: 'TEN',
        byeWeek: 13
      },
      {
        name: 'WAS',
        byeWeek: 9
      },
      {
        name: 'FA',
        byeWeek: 0
      }
    ], $scope.contractYears = [
      0,
      1,
      2,
      3
    ], $scope.playerPositions = [
      'QB',
      'RB',
      'WR',
      'TE',
      'K',
      'D'
    ], $scope.initializePlayer = function () {
      $scope.player = {}, $scope.player.player = '', $scope.player.absRank = 500, $scope.player.posRank = 500, $scope.player.price = 0, $scope.player.rookie = !1, $scope.player.yearsOwned = $scope.contractYears[0];
    }, $scope.initializeEditPlayer = function () {
      $scope.myOwner = {};
      var playerId = $stateParams.playerId;
      $http.get('/players/' + playerId).success(function (data, status) {
        $scope.player = data;
      }).then(function () {
        var nullOwner = {};
        nullOwner.name = 'none', nullOwner._id = null, $scope.content = '', $scope.playerArray = [], $http.get('/owners').success(function (data, status) {
          $scope.owners = data, console.log($scope.owners);
        }).then(function () {
          if ($scope.owners.push(nullOwner), $scope.player.owner) {
            for (var x = 0; x < $scope.owners.length; x++)
              $scope.player.owner == $scope.owners[x]._id && ($scope.myOwner = $scope.owners[x]);
            $scope.oldOwner = $scope.player.owner;
          } else
            $scope.oldOwner = null;
        }).then(function () {
          $scope.findOne();
        });
      });
    }, $scope.initializeBatchUpload = function () {
      var nullOwner = {};
      nullOwner.name = 'none', nullOwner._id = null, $scope.content = '', $scope.playerArray = [], $http.get('/owners').success(function (data, status) {
        $scope.owners = data, console.log($scope.owners);
      }).then(function () {
        $scope.owners.push(nullOwner);
      });
    }, $scope.showContent = function ($fileContent) {
      $scope.content = $fileContent, console.log($scope.content);
    }, $scope.parseCSV = function (upload) {
      '' == $scope.content ? console.log('input something first') : $scope.CSVToArray($scope.content);
    }, $scope.CSVToUpdate = function (strData) {
      var cols, i, oName, rows = strData.split('\n'), player = {};
      for (i = 1; i < rows.length; i++)
        oName = '', cols = rows[i].split(','), player = {}, player.name = cols[0], player.position = cols[1], player.absRank = Number(cols[2]), player.posRank = Number(cols[3]), player.uploaded = !1, player.toUpload = !0, $scope.playerArray.push(player);
    }, $scope.CSVToArray = function (strData) {
      var cols, i, j, oName, teamIn, rows = strData.split('\n'), player = {};
      for (i = 1; i < rows.length; i++) {
        if (oName = '', cols = rows[i].split(','), player = {}, player.team = {}, player.name = cols[0], player.position = cols[1], player.absRank = Number(cols[4]), player.posRank = Number(cols[5]), player.uploaded = !1, player.toUpload = !0, 'TRUE' == cols[6] ? player.rookie = !0 : player.rookie = !1, player.price = Number(cols[7]), player.yearsOwned = Number(cols[8]), player.owner = {}, oName = cols[9], oName = oName.trim(), '' != oName)
          for (console.log(oName), j = 0; j < $scope.owners.length; j++)
            $scope.owners[j].name == oName && (player.owner = $scope.owners[j]);
        else
          player.owner = null;
        if (teamIn = cols[2], '' != teamIn)
          for (j = 0; j < $scope.teams.length; j++)
            $scope.teams[j].name == teamIn && (player.team = $scope.teams[j]);
        $scope.playerArray.push(player);
      }
    }, $scope.updateRanks = function () {
      var i;
      for (i = 0; i < $scope.playerArray.length; i++)
        $scope.playerArray[i].user = $scope.authentication.user._id;
      socket.emit('updateRanks', $scope.playerArray);
    }, $scope.markOldPlayers = function () {
      socket.emit('markOldPlayers', $scope.playerArray);
    }, $scope.oldPlayers = function () {
      socket.emit('oldPlayers');
    }, $scope.startNewYear = function () {
      socket.emit('startNewSeason');
    }, $scope.teamQuality = function () {
      socket.emit('teamQuality');
    }, $scope.currentlyRostered = function () {
      socket.emit('currentlyRostered');
    }, $scope.batchAdd = function () {
      var i, uploadPlayer, newPlayer, j, req = {};
      for (i = 0; i < $scope.playerArray.length; i++)
        uploadPlayer = $scope.playerArray[i], null != uploadPlayer.owner && (uploadPlayer.available = !1), uploadPlayer.toUpload && (newPlayer = new Players({
          name: uploadPlayer.name,
          position: uploadPlayer.position,
          team: uploadPlayer.team,
          absRank: uploadPlayer.absRank,
          posRank: uploadPlayer.posRank,
          rookie: uploadPlayer.rookie,
          price: uploadPlayer.price,
          yearsOwned: uploadPlayer.yearsOwned,
          available: uploadPlayer.available
        }), null != uploadPlayer.owner && (newPlayer.owner = uploadPlayer.owner._id), newPlayer.$save(function (response) {
          console.log(response), null != response.owner && '' != response.owner && (req = {}, req.ownerId = response.owner, req.playerId = response._id, $http.put('/batchAddPlayer', req).success(function (data, status) {
            for (console.log(data), j = 0; j < $scope.playerArray.length; j++)
              $scope.playerArray[j].name == response.name && (console.log($scope.playerArray[j]), $scope.playerArray[j].uploaded = !0, $scope.playerArray[j].toUpload = !1);
          }));
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message, console.log($scope.error), console.log(newPlayer.name + ' - fail');
        }));
    }, $scope.create = function () {
      if (void 0 === $scope.player.position || void 0 === $scope.player.name)
        alert('cmon man...don\'t be lazy');
      else {
        var newPlayer = new Players({
            name: $scope.player.name,
            position: $scope.player.position,
            team: $scope.player.team,
            absRank: $scope.player.absRank,
            posRank: $scope.player.posRank,
            rookie: $scope.player.rookie,
            price: $scope.player.price,
            yearsOwned: $scope.player.yearsOwned
          });
        console.log(newPlayer), newPlayer.$save(function (response) {
          socket.emit('updatePlayers'), $location.path('players/' + response._id + '/edit');
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    }, $scope.remove = function () {
      var ownerReq = {};
      ownerReq.ownerId = $scope.oldOwner, ownerReq.playerId = $scope.player._id, ownerReq.oldMarker = !0, console.log('old change'), console.log(ownerReq), $http.put('/ownerChange', ownerReq).success(function (data, status) {
        console.log('changed the old one'), console.log(data);
      }).then(function () {
        $scope.dPlayer.$remove(), $location.path('admin-players');
      });
    }, $scope.update = function () {
      var req = {}, updateOwner = !1, ownerReq = {};
      $scope.myOwner && $scope.myOwner._id != $scope.oldOwner && ($scope.player.owner = $scope.myOwner._id, updateOwner = !0), req.player = $scope.player, $http.put('/players/' + $scope.player._id, req).success(function (data, status) {
      }).then(function () {
        updateOwner ? (ownerReq.ownerId = $scope.oldOwner, ownerReq.playerId = $scope.player._id, ownerReq.oldMarker = !0, $http.put('/ownerChange', ownerReq).success(function (data, status) {
          console.log('changed the old one');
        }).then(function () {
          ownerReq.ownerId = $scope.player.owner, ownerReq.oldMarker = !1, console.log('new change'), $http.put('/ownerChange', ownerReq).success(function (data, status) {
            console.log('changed the new one'), $location.path('admin-players');
          });
        })) : $location.path('admin-players');
      });
    }, $scope.find = function () {
      $scope.players = Players.query();
    }, $scope.findOne = function () {
      $scope.dPlayer = Players.get({ playerId: $stateParams.playerId });
    }, $scope.changeAvailable = function (value) {
      return 1 === value ? ($scope.filters.available = '', void ($scope.availableString = 'All Players')) : 2 === value ? ($scope.filters.available = !0, void ($scope.availableString = 'Free Agents')) : ($scope.filters.available = !1, void ($scope.availableString = 'Currently Owned'));
    }, $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    }, $scope.listFilter = function (position, available) {
      return function (list) {
        return list.available === available || '' === available ? list.position.match(position) : void 0;
      };
    }, $scope.sortType = 'absRank', $scope.sortReverse = !1, $scope.searchPlayer = '', $scope.filters = {}, $scope.filters.position = '', $scope.availableString = 'All Players', $scope.filters.available = '', $scope.availableString = '';
  }
]), angular.module('players').directive('readFile', [
  '$parse',
  function ($parse) {
    return {
      restrict: 'A',
      scope: !1,
      link: function (scope, element, attrs) {
        var fn = $parse(attrs.readFile);
        element.on('change', function (onChangeEvent) {
          var reader = new FileReader();
          reader.onload = function (onLoadEvent) {
            scope.$apply(function () {
              fn(scope, { $fileContent: onLoadEvent.target.result });
            });
          }, reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  }
]), angular.module('players').factory('Players', [
  '$resource',
  function ($resource) {
    return $resource('players/:playerId', { playerId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('sales').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('listSales', {
      url: '/sales',
      templateUrl: 'modules/sales/views/list-sales.client.view.html'
    }).state('createSale', {
      url: '/sales/create',
      templateUrl: 'modules/sales/views/create-sale.client.view.html'
    }).state('viewSale', {
      url: '/sales/:saleId',
      templateUrl: 'modules/sales/views/view-sale.client.view.html'
    }).state('editSale', {
      url: '/sales/:saleId/edit',
      templateUrl: 'modules/sales/views/edit-sale.client.view.html'
    });
  }
]), angular.module('sales').controller('SalesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Sales',
  function ($scope, $stateParams, $location, Authentication, Sales) {
    $scope.authentication = Authentication, $scope.create = function () {
      var sale = new Sales({ name: this.name });
      sale.$save(function (response) {
        $location.path('sales/' + response._id), $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.remove = function (sale) {
      if (sale) {
        sale.$remove();
        for (var i in $scope.sales)
          $scope.sales[i] === sale && $scope.sales.splice(i, 1);
      } else
        $scope.sale.$remove(function () {
          $location.path('sales');
        });
    }, $scope.update = function () {
      var sale = $scope.sale;
      sale.$update(function () {
        $location.path('sales/' + sale._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.find = function () {
      $scope.sales = Sales.query();
    }, $scope.findOne = function () {
      $scope.sale = Sales.get({ saleId: $stateParams.saleId });
    };
  }
]), angular.module('sales').factory('Sales', [
  '$resource',
  function ($resource) {
    return $resource('sales/:saleId', { saleId: '@_id' }, { update: { method: 'PUT' } });
  }
]), angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              Authentication.user = null, $location.path('signin');
              break;
            case 403:
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]), angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('select-owner', {
      url: '/select-owner',
      templateUrl: 'modules/users/views/select-owner.client.view.html'
    }).state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    });
  }
]), angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication, $scope.authentication.user && $location.path('/'), $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $location.path('/roster');
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        $scope.authentication.user = response, $scope.authentication.ownerId ? $location.path('/') : $location.path('/roster');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]), angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'Owners',
  function ($scope, $http, $location, Users, Authentication, Owners) {
    $scope.user = Authentication.user, $scope.user || $location.path('/'), $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData)
        return !0;
      return !1;
    }, $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    }, $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null, $http['delete']('/users/accounts', { params: { provider: provider } }).success(function (response) {
        $scope.success = !0, $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null, $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        $scope.success = !0, $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    }, $scope.initialize = function () {
      $scope.owners = Owners.query(), void 0 == $scope.user.owner && '' == $scope.user.owner || $location.path('/');
    }, $scope.setOwner = function (owner) {
      $scope.owner = owner, $scope.owner.myUser = $scope.user._id, $scope.user.ownerId = owner._id;
    }, $scope.associateOwner = function () {
      void 0 === $scope.owner ? alert('you must select an account') : ($scope.updateOwner(), $scope.updateUserProfile(), console.log($scope.owner));
    }, $scope.hasUserFilter = function (input) {
      return void 0 == input.myUser || '' == input.myUser;
    }, $scope.updateOwner = function () {
      var owner = $scope.owner;
      owner.$update(function () {
        console.log('owner updated');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }, $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = !0, Authentication.user = response, console.log('user updated');
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]), angular.module('users').filter('hasOwner', function () {
  return function (input) {
    return console.log('hi'), console.log(input[0]), input;
  };
}), angular.module('users').factory('Authentication', [function () {
    var _this = this;
    return _this._data = { user: window.user }, _this._data;
  }]), angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);