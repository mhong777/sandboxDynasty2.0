'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'sandboxdynasty';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'ngRoute'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');  //$locationProvider.html5Mode(true);
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('bids');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('gvars');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('hists');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('owners');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('players');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('sales');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
//Setting up route
angular.module('bids').config([
  '$stateProvider',
  function ($stateProvider) {
    // Bids state routing
    $stateProvider.state('rfa-match', {
      url: '/rfa-match',
      templateUrl: 'modules/bids/views/rfa-match.client.view.html'
    }).state('rfa', {
      url: '/rfa',
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
]);'use strict';
// Bids controller
angular.module('bids').controller('BidsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Bids',
  function ($scope, $stateParams, $location, Authentication, Bids) {
    $scope.authentication = Authentication;
    // Create new Bid
    $scope.create = function () {
      // Create new Bid object
      var bid = new Bids({ name: this.name });
      // Redirect after save
      bid.$save(function (response) {
        $location.path('bids/' + response._id);
        // Clear form fields
        $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Bid
    $scope.remove = function (bid) {
      if (bid) {
        bid.$remove();
        for (var i in $scope.bids) {
          if ($scope.bids[i] === bid) {
            $scope.bids.splice(i, 1);
          }
        }
      } else {
        $scope.bid.$remove(function () {
          $location.path('bids');
        });
      }
    };
    // Update existing Bid
    $scope.update = function () {
      var bid = $scope.bid;
      bid.$update(function () {
        $location.path('bids/' + bid._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Bids
    $scope.find = function () {
      $scope.bids = Bids.query();
    };
    // Find existing Bid
    $scope.findOne = function () {
      $scope.bid = Bids.get({ bidId: $stateParams.bidId });
    };
  }
]);'use strict';
angular.module('bids').controller('RfaMatchController', [
  '$scope',
  function ($scope) {
  }
]);'use strict';
angular.module('bids').controller('RfaController', [
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
    //INITIALIZE FUNCTION
    // Find a list of Owners
    $scope.getOwners = function () {
      var x = 0, salary = 0;  //ownersAndPlayers
    };
    //need a function to get all of the bids too
    //available salary = totalCap - (keeperSalary + outstandingBids)
    //outstandingBids = loop through current bids to see which ones you own
    //need to get your own info to look at your roster and such
    $scope.initialize = function () {
      if (!Authentication) {
        console.log('need to log in first');
        $location.path('/');
      } else {
        $scope.salary = 0;
        $scope.numPlayers;
        //should be in gvars
        //$scope.salaryCap=300;
        //$scope.maxPlayers=22;
        //for hiding everything
        //$scope.bidShow=true;
        //$scope.matchShow=true;
        //$scope.timerShow=true;
        //$scope.draftShow=true;
        //for counter
        //$scope.counter=100;
        $scope.mins = '';
        $scope.secs = '';
        //$scope.countdown();
        //Filter for finding players
        $scope.sortType = 'absRank';
        $scope.sortReverse = false;
        $scope.searchPlayer = '';
        $scope.filters = {};
        $scope.filters.position = '';
        $scope.availableString = 'All Players';
        $scope.filters.available = '';
        $scope.availableString = '';
        $scope.filters.rookie = '';
        $scope.user = Authentication.user;
        try {
          $scope.user._id;
        } catch (e) {
          $location.path('/');
        }
        if ($scope.user._id == null) {
          $location.path('/');
        }
        $http.get('/gvars').success(function (data, status) {
          $scope.gvar = data[0];
        }).then(function () {
          if ($scope.gvar.rookieDraft) {
            $scope.filters.rookie = true;
          }
          $http.get('/bids').success(function (data, status) {
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
      }
    };
    $scope.setMetrics = function () {
      console.log('setting metrics');
      var x, salary = 0, fxnOut, numPlayer;
      for (x = 0; x < $scope.owners.length; x++) {
        salary = 0;
        fxnOut = $scope.getSalary($scope.owners[x]);
        salary = fxnOut[0];
        numPlayer = fxnOut[1];
        $scope.owners[x].salary = salary;
        $scope.owners[x].numPlayer = numPlayer;
        if ($scope.owners[x].myUser == $scope.user._id) {
          $scope.salary = salary;
          $scope.numPlayers = numPlayer;
          $scope.myOwner = $scope.owners[x];
          $scope.dispOwner = $scope.owners[x];
        }
      }
      console.log($scope.gvar.salaryCap - $scope.myOwner.salary);
    };
    $scope.getSalary = function (owner) {
      var x = 0, salary = 0, bid, numPlayer = 0;
      for (x = 0; x < owner.keepRoster.length; x++) {
        salary += owner.keepRoster[x].price;
        numPlayer++;
      }
      if ($scope.gvar.rfaDraft) {
        for (x = 0; x < $scope.bids.length; x++) {
          bid = $scope.bids[x];
          if (bid.owner._id == owner._id) {
            salary += bid.price;
            numPlayer++;
          }
        }
      }
      return [
        Math.ceil(salary),
        numPlayer
      ];
    };
    /****
		 * FOR HTML COSMETICS
		 */
    $scope.viewOwner = function (owner) {
      $scope.dispOwner = owner;
    };
    $scope.checkAmount = function (price) {
      console.log(price + ' - ' + $scope.salary);
    };
    /*****
		 *MAIN FUNCTIONS
		 ****/
    //made function to check the bid - can be used for both rfa and auction
    $scope.submitBid = function (bid) {
      var bidTest = 0, x, salary = $scope.myOwner.salary, numPlayers = $scope.myOwner.numPlayer;
      //function to validate and put in bid
      if (bid.myBid > bid.price) {
        //check to see if the salary is under the cap
        // - need to check if the bid is the same as another
        for (x = 0; x < $scope.bids.length; x++) {
          if ($scope.bids[x]._id == bid._id) {
            if ($scope.bids[x].owner._id == $scope.ownerId) {
              salary = salary - $scope.bids[x].price;
              numPlayers--;
            }
            break;
          }
        }
        salary = salary + bid.myBid;
        numPlayers++;
        if (salary <= $scope.gvar.salaryCap + $scope.myOwner.extraMoney && numPlayers <= $scope.gvar.maxPlayers) {
          //send to socket - then update
          var input = {};
          input.bid = bid;
          input.owner = $scope.myOwner._id;
          socket.emit('modRfaBid', input);
        } else {
          console.log('cant do that bcz you are either over salary cap or max players');
        }
      } else {
        console.log('cant do that bcz you have to bid more than current price');
      }
    };
    $scope.matchBid = function (bid) {
      $scope.draft(bid.player._id, bid.price, bid._id);
    };
    $scope.draftRookie = function (rookie, playerId, price, bidId) {
      if (rookie) {
        $scope.draft(playerId, price, bidId);
      }
    };
    //draft
    $scope.draft = function (playerId, price, bidId) {
      var input = {};
      input.playerId = playerId;
      input.ownerId = $scope.myOwner._id;
      input.price = price;
      input.bidId = bidId;
      socket.emit('draft', input);
    };
    $scope.nominate = function (playerId, playerName) {
      var input = {};
      input.price = 1;
      input.player = playerId;
      input.owner = $scope.myOwner._id;
      input.user = $scope.user._id;
      input.origOwner = null;
      input.name = 'bid for ' + playerName;
      socket.emit('nominate', input);  //console.log(input);
    };
    //other
    socket.on('updatePlayers', function (input) {
      $scope.players = input;
      $scope.$digest();  //console.log('update player');
    });
    socket.on('updateOwners', function (input) {
      $scope.owners = input;
      $scope.setMetrics();
      $scope.$digest();  //console.log('update owner');
    });
    socket.on('updateBids', function (input) {
      $scope.bids = input;
      $scope.$digest();  //console.log('update bids');
    });
    socket.on('updateHistory', function (input) {
      $scope.hists = input;
      $scope.$digest();
    });
    socket.on('updateRfa', function (input) {
      var x, salary, fxnOut, numPlayer;
      //update the bid
      $scope.bids = input;
      $scope.setMetrics();
      //console.log(input);
      $scope.$digest();
    });
    socket.on('updateGvar', function (input) {
      $scope.gvar = input;
      if ($scope.gvar.rookieDraft) {
        $scope.filters.rookie = true;
      } else {
        $scope.filters.rookie = '';
      }
      $scope.$digest();
    });
    socket.on('timer', function (input) {
      //console.log(input.countdown);
      $scope.mins = parseInt(input.countdown / 60);
      $scope.secs = parseInt(input.countdown % 60);
      if ($scope.secs < 10) {
        $scope.secs = '0' + $scope.secs;
      }
      //console.log($scope.secs);
      //console.log(typeof $scope.secs);
      //console.log($scope.mins);
      //console.log(typeof $scope.mins)
      $scope.$digest();
    });
    /*******
		 *FOR FILTERS
		 *******/
    $scope.changeAvailable = function (value) {
      if (value === 1) {
        $scope.filters.available = '';
        $scope.availableString = 'All Players';
        return;
      } else if (value === 2) {
        $scope.filters.available = true;
        $scope.availableString = 'Free Agents';
        return;
      } else {
        $scope.filters.available = false;
        $scope.availableString = 'Currently Owned';
        return;
      }
    };
    //filter by position
    $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    };
    $scope.listFilter = function (position, available, rookie) {
      return function (list) {
        if (list.available === available || available === '') {
          if (list.rookie == rookie || rookie === '') {
            return list.position.match(position);
          }
        }
      };
    };
    /*****
		 * FOR TIMER
		 ****/
    var stopped;
    $scope.countdown = function () {
      stopped = $timeout(function () {
        $scope.counter--;
        $scope.mins = parseInt($scope.counter / 60);
        $scope.secs = parseInt($scope.counter % 60);
        $scope.countdown();
      }, 1000);
    };  //minutes = parseInt(seconds_left / 60);
        //seconds = parseInt(seconds_left % 60);
  }
]);'use strict';
//Bids service used to communicate Bids REST endpoints
angular.module('bids').factory('Bids', [
  '$resource',
  function ($resource) {
    return $resource('bids/:bidId', { bidId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('rules', {
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
]);'use strict';
angular.module('core').controller('AdminPgController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http) {
    $scope.dumpPlayers = function () {
      socket.emit('dumpPlayers');
    };
    $scope.startRfaDraft = function () {
      socket.emit('startRfaDraft');
    };
    $scope.startRfaMatch = function () {
      socket.emit('startRfaMatch');
    };
    $scope.endRfaMatch = function () {
      socket.emit('endRfaMatch');
    };
    $scope.inbetweenDraft = function () {
      socket.emit('inbetweenDraft');
    };
    $scope.startRookieDraft = function () {
      socket.emit('startRookieDraft');
    };
    $scope.endRookieDraft = function () {
      socket.emit('endRookieDraft');
    };
    $scope.startAuctionDraft = function () {
      socket.emit('startAuctionDraft');
    };
    $scope.endAuctionDraft = function () {
      socket.emit('endAuctionDraft');
    };
    $scope.startSnake = function () {
      socket.emit('startSnake');
    };
    $scope.iterate = function () {
      socket.emit('iterate');
    };
    $scope.executeBid = function () {
      socket.emit('executeBid');
    };
    $scope.timeExample = function () {
      socket.emit('timeExample');
    };
    $scope.resetTime = function () {
      socket.emit('resetTime');
    };
    $scope.stopTime = function () {
      socket.emit('stopTime');
    };
    $scope.pauseTimer = function () {
      socket.emit('pauseTimer');
    };
    $scope.restartTimer = function () {
      socket.emit('restartTimer');
    };
    // Find a list of Owners
    $scope.findOwners = function () {
      $scope.owners = Owners.query();
      //$scope.owners.push(null);
      $scope.drafter = {};
      $scope.drafter._id = null;
      $scope.drafter.name = '';
    };
    $scope.changeDrafter = function () {
      socket.emit('changeDrafter', $scope.drafter);
    };
    $scope.endRfa = function () {
      socket.emit('endRfa');
    };
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
//Setting up route
angular.module('gvars').config([
  '$stateProvider',
  function ($stateProvider) {
    // Gvars state routing
    $stateProvider.state('listGvars', {
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
]);'use strict';
// Gvars controller
angular.module('gvars').controller('GvarsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Gvars',
  'Owners',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Gvars, Owners, socket) {
    $scope.authentication = Authentication;
    // Create new Gvar
    $scope.create = function () {
      // Create new Gvar object
      var gvar = new Gvars({ name: this.name });
      // Redirect after save
      gvar.$save(function (response) {
        $location.path('gvars/' + response._id);
        // Clear form fields
        $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Gvar
    $scope.remove = function (gvar) {
      if (gvar) {
        gvar.$remove();
        for (var i in $scope.gvars) {
          if ($scope.gvars[i] === gvar) {
            $scope.gvars.splice(i, 1);
          }
        }
      } else {
        $scope.gvar.$remove(function () {
          $location.path('gvars');
        });
      }
    };
    // Update existing Gvar
    $scope.update = function () {
      var gvar = $scope.gvar;
      gvar.$update(function () {
        $location.path('gvars/' + gvar._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Gvars
    $scope.find = function () {
      $scope.gvars = Gvars.query();
    };
    //ROOKIE DRAFT ORDER
    $scope.startDraftOrder = function () {
      var x;
      x = $scope.gvar.draftOrder;
      $scope.draft = x;
    };
    $scope.addDraft = function () {
      $scope.draft.push(null);
    };
    $scope.changeDraft = function (index, pick) {
      $scope.gvar.draftOrder.splice(index, 1, pick._id);
    };
    //OTHER DRAFT ORDER
    $scope.startpickOrder = function () {
      var x;
      x = $scope.gvar.pickOrder;
      $scope.pickDraft = x;
    };
    $scope.addPick = function () {
      $scope.pickDraft.push(null);
    };
    $scope.changePick = function (index, pick) {
      $scope.gvar.pickOrder.splice(index, 1, pick._id);
    };
    // Find existing Gvar
    $scope.findOne = function () {
      $scope.gvar = Gvars.get({ gvarId: $stateParams.gvarId });
      $scope.owners = Owners.query();
      $scope.draft;
      $scope.draftTimer = 0;
    };
    $scope.startTimer = function () {
      socket.emit('startTimer', $scope.draftTimer);
    };
  }
]);'use strict';
//Gvars service used to communicate Gvars REST endpoints
angular.module('gvars').factory('Gvars', [
  '$resource',
  function ($resource) {
    return $resource('gvars/:gvarId', { gvarId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('hists').config([
  '$stateProvider',
  function ($stateProvider) {
    // Hists state routing
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
]);'use strict';
// Hists controller
angular.module('hists').controller('HistsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Hists',
  function ($scope, $stateParams, $location, Authentication, Hists) {
    $scope.authentication = Authentication;
    // Create new Hist
    $scope.create = function () {
      // Create new Hist object
      var hist = new Hists({ name: this.name });
      // Redirect after save
      hist.$save(function (response) {
        $location.path('hists/' + response._id);
        // Clear form fields
        $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Hist
    $scope.remove = function (hist) {
      if (hist) {
        hist.$remove();
        for (var i in $scope.hists) {
          if ($scope.hists[i] === hist) {
            $scope.hists.splice(i, 1);
          }
        }
      } else {
        $scope.hist.$remove(function () {
          $location.path('hists');
        });
      }
    };
    // Update existing Hist
    $scope.update = function () {
      var hist = $scope.hist;
      hist.$update(function () {
        $location.path('hists/' + hist._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Hists
    $scope.find = function () {
      $scope.hists = Hists.query();
    };
    // Find existing Hist
    $scope.findOne = function () {
      $scope.hist = Hists.get({ histId: $stateParams.histId });
    };
  }
]);'use strict';
//Hists service used to communicate Hists REST endpoints
angular.module('hists').factory('Hists', [
  '$resource',
  function ($resource) {
    return $resource('hists/:histId', { histId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('owners').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Owners', 'owners', 'dropdown', '/owners(/create)?');
    Menus.addSubMenuItem('topbar', 'owners', 'List Owners', 'owners');
    Menus.addSubMenuItem('topbar', 'owners', 'New Owner', 'owners/create');
  }
]);'use strict';
//Setting up route
angular.module('owners').config([
  '$stateProvider',
  function ($stateProvider) {
    // Owners state routing
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
    }).state('assocPlayers', {
      url: '/assocPlayers',
      templateUrl: 'modules/owners/views/admin-player-owner.html'
    });
  }
]);'use strict';
// Owners controller
angular.module('owners').controller('assocPlayerController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket, $http) {
    $scope.authentication = Authentication;
    /****
         * INITIALIZATION
         *
         ****/
    $scope.initialze = function () {
      $scope.selectedOwner = {};
      $scope.owners = Owners.query();
    };
    $scope.initialze();
    /***
        ***INITIALIZATION
        ***Find a list of Owners
        ***/
    $scope.getTimer = function () {
      socket.emit('getTime');
    };
    $scope.getTimer();
    $scope.find = function () {
      $scope.owners = Owners.query();
      $scope.players = Players.query();
      $scope.selectedOwner = {};
      $scope.selectedPlayer = {};
      $scope.counter = 0;
    };
    $scope.selectOwner = function (owner) {
      $scope.selectedOwner = owner;
    };
    //outgoing call
    $scope.selectPlayer = function (player) {
      //make sure the owner is selected first
      if ($scope.selectedOwner._id) {
        $scope.input = {};
        $scope.input.ownerId = $scope.selectedOwner._id;
        $scope.input.playerId = player._id;
        socket.emit('choosePlayer', $scope.input);
      }
    };
    //response
    socket.on('playerChosen', function (output) {
      $scope.selectedOwner = output.owner;
      $scope.$digest();
    });
    /*****
        **TIMER
        *****/
    socket.on('timer', function (data) {
      $scope.counter = data.countdown;
      $scope.$digest();
    });
    socket.on('finalMsg', function (data) {
      $scope.msg = data.msg;
      $scope.$digest();
    });
    $scope.startTimer = function () {
      socket.emit('startTimer', 10);
    };
    $scope.resetTimer = function () {
      console.log('go reset');
      socket.emit('reset');
    };
  }
]);'use strict';
angular.module('owners').controller('EditRosterController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  '$modal',
  function ($scope, $stateParams, $location, Authentication, Owners, $http, $modal) {
    $scope.user = Authentication.user;
    //$scope.keeperCap=175;
    //$scope.totalCap=parseInt(300);
    $scope.changeTime = 1;
    $scope.timeCheck = false;
    $scope.rosterCheck = false;
    $scope.getOwner = function () {
      //console.log(Authentication.user);
      if (Authentication.user == null) {
        $location.path('/');
      } else {
        var ownerId = $stateParams.ownerId, x;
        $scope.salary = 0;
        $scope.rfaSalary = 0;
        $http.get('/gvars').success(function (data, status) {
          $scope.gvar = data[0];
          console.log($scope.gvar);
        }).then(function () {
          $http.get('/editRoster/' + ownerId).success(function (data, status) {
            $scope.owner = data;
          }).then(function () {
            if ($scope.owner.myUser == $scope.user._id) {
              $scope.rosterCheck = true;
            }
            console.log($scope.user.ownerId);
            console.log($scope.owner._id);
            $scope.setData();
          });
        });
      }
    };
    $scope.changeKeeper = function (player, status) {
      //check that the user owns the person first
      if ($scope.rosterCheck && $scope.changeTime == 1) {
        var req = {};
        req.status = status;
        req.ownerId = $scope.owner._id;
        req.playerId = player._id;
        //check which action you need to do 1=keep -1=un-keep
        if (status == 1) {
          //keep
          //check salary - if the salary is over - give them an alert
          if ($scope.salary + player.price <= $scope.gvar.keeperCap && $scope.rfaSalary + player.price <= $scope.gvar.salaryCap) {
            //rest - send status, ownerId, playerId
            //console.log(req);
            $http.put('/changeKeeper', req).success(function (data, status) {
              console.log('player added');
              console.log(data);
              $scope.owner = data;
            }).then(function () {
              $scope.setData();
            });
          } else {
            alert('sorry bud, you\'re over the limit');
          }
        } else {
          //just send
          console.log(req);
          $http.put('/changeKeeper', req).success(function (data, status) {
            console.log('player removed');
            console.log(data);
            $scope.owner = data;
          }).then(function () {
            $scope.setData();
          });
        }
      }
    };
    $scope.changeBidee = function (player, status) {
      //console.log(($scope.rfaSalary+player.price + $scope.salary));
      //console.log($scope.totalCap + $scope.owner.extraMoney);
      //check that the user owns the person first
      if ($scope.rosterCheck && $scope.changeTime == 1) {
        var req = {};
        req.status = status;
        req.ownerId = $scope.owner._id;
        req.playerId = player._id;
        //check which action you need to do 1=keep -1=un-keep
        if (status == 1) {
          //keep
          //check salary - if the salary is over - give them an alert
          if ($scope.rfaSalary + player.price + $scope.salary <= $scope.gvar.salaryCap + $scope.owner.extraMoney) {
            //rest - send status, ownerId, playerId
            console.log(req);
            $http.put('/changeBidee', req).success(function (data, status) {
              console.log('changed bidee');
              console.log(data);
              $scope.owner = data;
            }).then(function () {
              $scope.setData();
            });
          } else {
            alert('sorry bud, you don\'t have enough cash to pay for that');
          }
        } else {
          //just send
          console.log(req);
          $http.put('/changeBidee', req).success(function (data, status) {
            console.log(data);
            $scope.owner = data;
          }).then(function () {
            console.log('removed bidee');
            $scope.setData();
          });
        }
      }
    };
    $scope.setData = function () {
      var x, salary = 0, rfaSalary = 0;
      $scope.owner.keepEligable = [];
      $scope.owner.bidEligable = [];
      for (x = 0; x < $scope.owner.previousRoster.length; x++) {
        if ($scope.owner.previousRoster[x].yearsOwned < 3) {
          $scope.owner.keepEligable.push($scope.owner.previousRoster[x]);
        } else {
          $scope.owner.bidEligable.push($scope.owner.previousRoster[x]);
        }
      }
      for (x = 0; x < $scope.owner.keepRoster.length; x++) {
        //console.log($scope.owner.keepRoster[x].price);
        salary += $scope.owner.keepRoster[x].price;
      }
      for (x = 0; x < $scope.owner.bidRoster.length; x++) {
        rfaSalary += $scope.owner.bidRoster[x].price;
      }
      //$scope.salary=Math.round(salary*100)/100;
      //$scope.rfaSalary=Math.round(rfaSalary*100)/100;
      //$scope.salary=parseFloat(salary.toFixed(1));
      $scope.salary = Math.ceil(salary);
      //parseFloat(Math.round(salary*100)/100);
      $scope.rfaSalary = Math.ceil(rfaSalary);
      //parseFloat(Math.round(rfaSalary*100)/100);
      //$scope.rfaSalary=parseFloat(rfaSalary.toFixed(1));
      if ($scope.rosterCheck) {
        $scope.errMsg = false;
      } else {
        $scope.errMsg = true;
      }
    };
    //MODAL
    $scope.open = function (myMode) {
      if (myMode == 1) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'modules/owners/views/keeper-modal.client.view.html',
            controller: 'ModalController',
            size: 'lg'
          });
      } else {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'modules/owners/views/rfa-modal.client.view.html',
            controller: 'ModalController',
            size: 'lg'
          });
      }
    };
  }
]);'use strict';
angular.module('owners').controller('ModalController', [
  '$scope',
  function ($scope) {
  }
]);'use strict';
angular.module('owners').controller('MyplayersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  'Players',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Owners, Players, socket) {
    // Find existing Owner
    $scope.initialze = function () {
      $scope.owner = Owners.get({ ownerId: $stateParams.ownerId });
      $scope.players = Players.query();
    };
    $scope.initialze();
    //Assign Players
    $scope.assignPlayer = function (player) {
      if (player.available) {
        var input = {};
        input.ownerId = $scope.owner._id;
        input.playerId = player._id;
        socket.emit('choosePlayer', input);
        $scope.owner.previousRoster.push(player);
        player.available = false;
      }
    };
    //Unassign Players
    $scope.unassignPlayer = function (player) {
      var input = {};
      input.ownerId = $scope.owner._id;
      input.playerId = player._id;
      for (var x = 0; x < $scope.owner.previousRoster.length; x++) {
        if ($scope.owner.previousRoster[x]._id == player._id) {
          $scope.owner.previousRoster.splice(x, 1);
          input.playerLoc = x;
          break;
        }
      }
      for (x = 0; x < $scope.players.length; x++) {
        if ($scope.players[x]._id == player._id) {
          $scope.players[x].available = true;
          break;
        }
      }
      socket.emit('unchoosePlayer', input);
    };
  }
]);'use strict';
// Owners controller
angular.module('owners').controller('OwnersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  'Users',
  function ($scope, $stateParams, $location, Authentication, Owners, $http, Users) {
    $scope.authentication = Authentication;
    // Create new Owner
    $scope.create = function () {
      // Create new Owner object
      var owner = new Owners({ name: this.name });
      // Redirect after save
      owner.$save(function (response) {
        $location.path('owners');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Owner
    $scope.remove = function (owner) {
      if (owner) {
        owner.$remove();
        for (var i in $scope.owners) {
          if ($scope.owners[i] === owner) {
            $scope.owners.splice(i, 1);
          }
        }
        $location.path('owners');
      } else {
        $scope.owner.$remove(function () {
          $location.path('owners');
        });
      }
    };
    // Update existing Owner
    $scope.update = function () {
      //if($scope.oldUser!=$scope.owner.myUser){
      //	//de-associate the old user
      //	$scope.deassociateUser;
      //	var user;
      //	for(var x=0;x<$scope.allUsers.length;x++){
      //		if($scope.allUsers[x]._id==$scope.oldUser){
      //			$scope.deassociateUser=$scope.allUsers[x];
      //			$scope.deassociateUser.ownerId=null;
      //			$http.put('/users',$scope.deassociateUser).
      //				success(function(data, status){
      //					console.log('deassociated user');
      //					console.log(data);
      //				});
      //			break;
      //		}
      //	}
      //}
      var owner = $scope.owner, req = {};
      //req.user=$scope.associateUser;
      //$http.put('/users/ownerUpdate',req).
      //	success(function(data, status){
      //		console.log('associate user');
      //		console.log(data);
      //	}). then(function(){
      //
      //	});
      $http.put('/owners/' + owner._id, owner).success(function (data, status) {
        console.log('owner data');
        console.log(data);
      }).then(function () {
        $location.path('owners');
      });
    };
    // Find a list of Owners
    $scope.find = function () {
      $scope.owners = Owners.query();
    };
    $scope.getUsers = function () {
      $http.get('/allUsers').success(function (data, status) {
        $scope.allUsers = data;
      });
    };
    $scope.initializeEditOwner = function () {
      $scope.findOne();
      $scope.find();
      $scope.getUsers();
    };
    // Find existing Owner
    $scope.findOne = function () {
      var ownerId = $stateParams.ownerId;
      $http.get('/owners/' + ownerId).success(function (data, status) {
        $scope.owner = data;
      }).then(function () {
        $scope.associateUser = {};
        $scope.associateUser._id = $scope.owner.myUser;
        $scope.oldUser = $scope.owner.myUser;
      });
    };
    $scope.changeOwnerUser = function () {
      $scope.owner.myUser = $scope.associateUser._id;
      $scope.associateUser.ownerId = $scope.owner._id;
    };
  }
]);'use strict';
angular.module('owners').controller('RemoveOwnerController', [
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
]);'use strict';
angular.module('owners').controller('ReviewRosterController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Owners',
  '$http',
  function ($scope, $stateParams, $location, Authentication, Owners, $http) {
    //INITIALIZE FUNCTION
    // Find a list of Owners
    $scope.getOwners = function () {
      var x = 0, salary;
      $http.get('/gvars').success(function (data, status) {
        $scope.gvar = data[0];
      }).then(function () {
        $http.get('/reviewRoster').success(function (data, status) {
          $scope.owners = data;
        }).then(function () {
          for (x = 0; x < $scope.owners.length; x++) {
            salary = 0;
            salary = $scope.getSalary($scope.owners[x]);
            $scope.owners[x].salary = salary;
          }
        });
      });
    };
    $scope.initialize = function () {
      if (Authentication.user == null) {
        $location.path('/');
      } else {
        $scope.getOwners();
        $scope.salaryCap = 300;
        $scope.keeperCap = 175;
      }
    };
    $scope.goToRoster = function (ownerId) {
      $location.path('edit-roster/' + ownerId);
    };
    $scope.getSalary = function (owner) {
      var x = 0, salary = 0;
      for (x = 0; x < owner.keepRoster.length; x++) {
        salary += owner.keepRoster[x].price;
      }
      return salary.toFixed(2);
    };
  }
]);'use strict';
//Owners service used to communicate Owners REST endpoints
angular.module('owners').factory('Owners', [
  '$resource',
  function ($resource) {
    return $resource('owners/:ownerId', { ownerId: '@_id' }, { update: { method: 'PUT' } });
  }
]);
angular.module('owners').factory('socket', function () {
  var socket = io.connect('/');
  //    var socket=io.connect('http://localhost:3000');
  return socket;
});'use strict';
// Configuring the Articles module
angular.module('players').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Players', 'players', 'dropdown', '/players(/create)?');
    Menus.addSubMenuItem('topbar', 'players', 'List Players', 'players');
    Menus.addSubMenuItem('topbar', 'players', 'New Player', 'players/create');
  }
]);'use strict';
//Setting up route
angular.module('players').config([
  '$stateProvider',
  function ($stateProvider) {
    // Players state routing
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
]);'use strict';
// Players controller
angular.module('players').controller('PlayersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Players',
  'Owners',
  '$http',
  'socket',
  function ($scope, $stateParams, $location, Authentication, Players, Owners, $http, socket) {
    $scope.authentication = Authentication;
    //###ADD IN ALL OF THE TEAMS
    $scope.teams = [
      {
        name: 'ARI',
        byeWeek: 9
      },
      {
        name: 'ATL',
        byeWeek: 10
      },
      {
        name: 'BAL',
        byeWeek: 9
      },
      {
        name: 'BUF',
        byeWeek: 8
      },
      {
        name: 'CAR',
        byeWeek: 5
      },
      {
        name: 'CHI',
        byeWeek: 7
      },
      {
        name: 'CIN',
        byeWeek: 7
      },
      {
        name: 'CLE',
        byeWeek: 11
      },
      {
        name: 'DAL',
        byeWeek: 6
      },
      {
        name: 'DEN',
        byeWeek: 7
      },
      {
        name: 'DET',
        byeWeek: 9
      },
      {
        name: 'GB',
        byeWeek: 7
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
        byeWeek: 8
      },
      {
        name: 'KC',
        byeWeek: 9
      },
      {
        name: 'MIA',
        byeWeek: 5
      },
      {
        name: 'MIN',
        byeWeek: 5
      },
      {
        name: 'NE',
        byeWeek: 4
      },
      {
        name: 'NO',
        byeWeek: 11
      },
      {
        name: 'NYG',
        byeWeek: 11
      },
      {
        name: 'NYJ',
        byeWeek: 5
      },
      {
        name: 'OAK',
        byeWeek: 6
      },
      {
        name: 'PHI',
        byeWeek: 8
      },
      {
        name: 'PIT',
        byeWeek: 11
      },
      {
        name: 'SD',
        byeWeek: 10
      },
      {
        name: 'SEA',
        byeWeek: 9
      },
      {
        name: 'SF',
        byeWeek: 10
      },
      {
        name: 'STL',
        byeWeek: 6
      },
      {
        name: 'TB',
        byeWeek: 6
      },
      {
        name: 'TEN',
        byeWeek: 4
      },
      {
        name: 'WAS',
        byeWeek: 8
      },
      {
        name: 'FA',
        byeWeek: 0
      }
    ];
    $scope.contractYears = [
      0,
      1,
      2,
      3
    ];
    $scope.playerPositions = [
      'QB',
      'RB',
      'WR',
      'TE',
      'K',
      'D'
    ];
    $scope.initializePlayer = function () {
      $scope.player = {};
      $scope.player.player = '';
      $scope.player.absRank = 500;
      $scope.player.posRank = 500;
      $scope.player.price = 0;
      $scope.player.rookie = false;
      $scope.player.yearsOwned = $scope.contractYears[0];
    };
    $scope.initializeEditPlayer = function () {
      $scope.myOwner = {};
      var playerId = $stateParams.playerId;
      $http.get('/players/' + playerId).success(function (data, status) {
        $scope.player = data;
      }).then(function () {
        //get owners
        var nullOwner = {};
        nullOwner.name = 'none';
        nullOwner._id = null;
        $scope.content = '';
        $scope.playerArray = [];
        $http.get('/owners').success(function (data, status) {
          $scope.owners = data;
          console.log($scope.owners);
        }).then(function () {
          //associate myOwner and add the null owner
          $scope.owners.push(nullOwner);
          if ($scope.player.owner) {
            for (var x = 0; x < $scope.owners.length; x++) {
              if ($scope.player.owner == $scope.owners[x]._id) {
                $scope.myOwner = $scope.owners[x];
              }
            }
            $scope.oldOwner = $scope.player.owner;
          } else {
            $scope.oldOwner = null;
          }
        }).then(function () {
          $scope.findOne();
        });
      });
    };
    $scope.initializeBatchUpload = function () {
      var nullOwner = {};
      nullOwner.name = 'none';
      nullOwner._id = null;
      $scope.content = '';
      $scope.playerArray = [];
      $http.get('/owners').success(function (data, status) {
        $scope.owners = data;
        console.log($scope.owners);
      }).then(function () {
        $scope.owners.push(nullOwner);
      });
    };
    $scope.showContent = function ($fileContent) {
      $scope.content = $fileContent;
      console.log($scope.content);
    };
    $scope.parseCSV = function () {
      if ($scope.content == '') {
        console.log('input something first');
      } else {
        $scope.CSVToArray($scope.content);
      }
    };
    $scope.CSVToArray = function (strData) {
      var rows = strData.split('\n'), player = {}, cols, i, j, oName, teamIn;
      //skip the first row because it has headers
      for (i = 1; i < rows.length; i++) {
        oName = '';
        cols = rows[i].split(',');
        //console.log(rows[i]);
        player = {};
        player.team = {};
        player.name = cols[0];
        player.position = cols[1];
        //player.team.byeWeek=Number(cols[3]);
        player.absRank = Number(cols[4]);
        player.posRank = Number(cols[5]);
        player.uploaded = false;
        player.toUpload = true;
        if (cols[6] == 'TRUE') {
          player.rookie = true;
        } else {
          player.rookie = false;
        }
        player.price = Number(cols[7]);
        player.yearsOwned = Number(cols[8]);
        //player.owner=cols[9];
        player.owner = {};
        oName = cols[9];
        oName = oName.trim();
        if (oName != '') {
          console.log(oName);
          for (j = 0; j < $scope.owners.length; j++) {
            if ($scope.owners[j].name == oName) {
              player.owner = $scope.owners[j];
            }
          }
        } else {
          player.owner = null;
        }
        //###DO THE SAME VALIDATION FOR THE TEAMS
        teamIn = cols[2];
        if (teamIn != '') {
          for (j = 0; j < $scope.teams.length; j++) {
            if ($scope.teams[j].name == teamIn) {
              player.team = $scope.teams[j];
            }
          }
        }
        $scope.playerArray.push(player);
      }
    };
    //upload player array
    $scope.batchAdd = function () {
      var i, uploadPlayer, newPlayer, j, req = {};
      for (i = 0; i < $scope.playerArray.length; i++) {
        uploadPlayer = $scope.playerArray[i];
        if (uploadPlayer.owner != null) {
          uploadPlayer.available = false;
        }
        if (uploadPlayer.toUpload) {
          // Create new Player object
          newPlayer = new Players({
            name: uploadPlayer.name,
            position: uploadPlayer.position,
            team: uploadPlayer.team,
            absRank: uploadPlayer.absRank,
            posRank: uploadPlayer.posRank,
            rookie: uploadPlayer.rookie,
            price: uploadPlayer.price,
            yearsOwned: uploadPlayer.yearsOwned,
            available: uploadPlayer.available
          });
          if (uploadPlayer.owner != null) {
            newPlayer.owner = uploadPlayer.owner._id;
          }
          //Add it to the DB
          newPlayer.$save(function (response) {
            //if a success log that it was a success and change the states of the player's properties
            //only update an owner if there is an owner to update
            console.log(response);
            if (response.owner != null && response.owner != '') {
              req = {};
              req.ownerId = response.owner;
              req.playerId = response._id;
              //console.log(req);
              $http.put('/batchAddPlayer', req).success(function (data, status) {
                console.log(data);
                for (j = 0; j < $scope.playerArray.length; j++) {
                  if ($scope.playerArray[j].name == response.name) {
                    console.log($scope.playerArray[j]);
                    $scope.playerArray[j].uploaded = true;
                    $scope.playerArray[j].toUpload = false;
                  }
                }
              });
            }
          }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
            console.log($scope.error);
            console.log(newPlayer.name + ' - fail');
          });  //console.log(newPlayer);
        }
      }
    };
    // Create new Player
    $scope.create = function () {
      //make it so you have to put in a position
      if ($scope.player.position === undefined || $scope.player.name === undefined) {
        alert('cmon man...don\'t be lazy');
      } else {
        // Create new Player object
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
        console.log(newPlayer);
        // Redirect after save
        newPlayer.$save(function (response) {
          socket.emit('updatePlayers');
          $location.path('players/' + response._id + '/edit');
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Remove existing Player
    $scope.remove = function () {
      var ownerReq = {};
      ownerReq.ownerId = $scope.oldOwner;
      ownerReq.playerId = $scope.player._id;
      ownerReq.oldMarker = true;
      console.log('old change');
      console.log(ownerReq);
      $http.put('/ownerChange', ownerReq).success(function (data, status) {
        console.log('changed the old one');
        console.log(data);
      }).then(function () {
        $scope.dPlayer.$remove();
        $location.path('players');
      });
    };
    // Update existing Player
    $scope.update = function () {
      var req = {}, updateOwner = false, ownerReq = {};
      if ($scope.myOwner) {
        if ($scope.myOwner._id != $scope.oldOwner) {
          $scope.player.owner = $scope.myOwner._id;
          updateOwner = true;
        }
      }
      console.log('request');
      console.log($scope.player);
      req.player = $scope.player;
      //update the owner
      $http.put('/players/' + $scope.player._id, req).success(function (data, status) {
        console.log('changed');
        console.log(data);
      }).then(function () {
        //update the owners - old one first, then new one - check if it is null
        if (updateOwner) {
          //do the old one first
          ownerReq.ownerId = $scope.oldOwner;
          ownerReq.playerId = $scope.player._id;
          ownerReq.oldMarker = true;
          console.log('old change');
          console.log(ownerReq);
          $http.put('/ownerChange', ownerReq).success(function (data, status) {
            console.log('changed the old one');
            console.log(data);
          }).then(function () {
            //do the new one
            ownerReq.ownerId = $scope.player.owner;
            ownerReq.oldMarker = false;
            console.log('new change');
            console.log(ownerReq);
            $http.put('/ownerChange', ownerReq).success(function (data, status) {
              console.log('changed the new one');
              console.log(data);
            });
          });
        }
      });
    };
    // Find a list of Players
    $scope.find = function () {
      $scope.players = Players.query();
    };
    // Find existing Player
    $scope.findOne = function () {
      $scope.dPlayer = Players.get({ playerId: $stateParams.playerId });
    };
    /*******
		 *FOR FILTERS
		 *******/
    $scope.changeAvailable = function (value) {
      if (value === 1) {
        $scope.filters.available = '';
        $scope.availableString = 'All Players';
        return;
      } else if (value === 2) {
        $scope.filters.available = true;
        $scope.availableString = 'Free Agents';
        return;
      } else {
        $scope.filters.available = false;
        $scope.availableString = 'Currently Owned';
        return;
      }
    };
    //filter by position
    $scope.addFilter = function (position) {
      $scope.filters.position.push(position);
    };
    $scope.listFilter = function (position, available) {
      return function (list) {
        //                console.log(list.available);
        //                console.log(available);
        if (list.available === available || available === '') {
          return list.position.match(position);
        }  //                    && list.available.match(available);
      };
    };
    //Filter for finding players
    $scope.sortType = 'absRank';
    $scope.sortReverse = false;
    $scope.searchPlayer = '';
    $scope.filters = {};
    $scope.filters.position = '';
    $scope.availableString = 'All Players';
    $scope.filters.available = '';
    $scope.availableString = '';
  }
]);'use strict';
angular.module('players').directive('readFile', [
  '$parse',
  function ($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs) {
        var fn = $parse(attrs.readFile);
        element.on('change', function (onChangeEvent) {
          var reader = new FileReader();
          reader.onload = function (onLoadEvent) {
            scope.$apply(function () {
              fn(scope, { $fileContent: onLoadEvent.target.result });
            });
          };
          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  }
]);'use strict';
//Players service used to communicate Players REST endpoints
angular.module('players').factory('Players', [
  '$resource',
  function ($resource) {
    return $resource('players/:playerId', { playerId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('sales').config([
  '$stateProvider',
  function ($stateProvider) {
    // Sales state routing
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
]);'use strict';
// Sales controller
angular.module('sales').controller('SalesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Sales',
  function ($scope, $stateParams, $location, Authentication, Sales) {
    $scope.authentication = Authentication;
    // Create new Sale
    $scope.create = function () {
      // Create new Sale object
      var sale = new Sales({ name: this.name });
      // Redirect after save
      sale.$save(function (response) {
        $location.path('sales/' + response._id);
        // Clear form fields
        $scope.name = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Sale
    $scope.remove = function (sale) {
      if (sale) {
        sale.$remove();
        for (var i in $scope.sales) {
          if ($scope.sales[i] === sale) {
            $scope.sales.splice(i, 1);
          }
        }
      } else {
        $scope.sale.$remove(function () {
          $location.path('sales');
        });
      }
    };
    // Update existing Sale
    $scope.update = function () {
      var sale = $scope.sale;
      sale.$update(function () {
        $location.path('sales/' + sale._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Sales
    $scope.find = function () {
      $scope.sales = Sales.query();
    };
    // Find existing Sale
    $scope.findOne = function () {
      $scope.sale = Sales.get({ saleId: $stateParams.saleId });
    };
  }
]);'use strict';
//Sales service used to communicate Sales REST endpoints
angular.module('sales').factory('Sales', [
  '$resource',
  function ($resource) {
    return $resource('sales/:saleId', { saleId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
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
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/roster');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        if ($scope.authentication.ownerId) {
          $location.path('/');
        } else {
          $location.path('/roster');
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'Owners',
  function ($scope, $http, $location, Users, Authentication, Owners) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Find a list of Owners
    $scope.initialize = function () {
      $scope.owners = Owners.query();
      if ($scope.user.owner != undefined || $scope.user.owner != '') {
        $location.path('/');
      }
    };
    $scope.setOwner = function (owner) {
      $scope.owner = owner;
      $scope.owner.myUser = $scope.user._id;
      $scope.user.ownerId = owner._id;
    };
    $scope.associateOwner = function () {
      if ($scope.owner === undefined) {
        alert('you must select an account');
      } else {
        $scope.updateOwner();
        $scope.updateUserProfile();
        console.log($scope.owner);
      }
    };
    //filter if the owner has a user or not
    $scope.hasUserFilter = function (input) {
      if (input.myUser == undefined || input.myUser == '') {
        return true;
      } else {
        return false;
      }
    };
    // Update existing Owner
    $scope.updateOwner = function () {
      var owner = $scope.owner;
      owner.$update(function () {
        console.log('owner updated');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
        console.log('user updated');
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);'use strict';
angular.module('users').filter('hasOwner', function () {
  return function (input) {
    console.log('hi');
    console.log(input[0]);
    return input;  //var filtered=[];
                   //for (var i=0; i<input.length(); i++){
                   //	if(input[i].myUser==undefined || input[i].myUser==''){
                   //		filtered.push(input[i]);
                   //	}
                   //}
                   //return filtered;
  };
});'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);