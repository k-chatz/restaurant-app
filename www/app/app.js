angular.module('restaurant', ['ionic', 'ngMaterial', 'ui.router', 'restaurant.config', 'restaurant.controllers', 'restaurant.filters', 'restaurant.directives', 'restaurant.services', 'ionic-multi-date-picker'])
// 'ngMockE2E'
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
      if ('data' in next && 'authorizedRoles' in next.data) {
        var authorizedRoles = next.data.authorizedRoles;
        if (!AuthService.isAuthorized(authorizedRoles)) {
          event.preventDefault();
          //$state.go('tab/menu');
          $state.go($state.current, {}, {reload: true});
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        }
      }

      if (!AuthService.isAuthenticated()) {
        if (next.name !== 'login') {
          event.preventDefault();
          $state.go('login');
        }
      }
    });
  })

  /*
  timer:
   .run(function(ClockSrv){
   ClockSrv.startClock(function(){
   console.log("clocksrv");
   });
   })
   */

  .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/forms/login.html',
        controller: 'loginCtrl'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'templates/forms/register.html',
        controller: 'registerCtrl'
      })

      .state('about', {
        url: '/about',
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      })

      .state('tab', {
        url: '/',
        abstract: true,
        templateUrl: 'templates/tabs/tabs.html'
      })

      .state('tab.menu', {
        url: 'tab/menu',
        views: {
          'menu-tab': {
            templateUrl: 'templates/tabs/menu.html',
            controller: 'menuTabCtrl'
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.visitor, USER_ROLES.boarder]
        }
      })

      .state('tab.take', {
        url: 'tab/take',
        views: {
          'take-tab': {
            templateUrl: 'templates/tabs/take.html',
            controller: 'takeTabCtrl'
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.visitor, USER_ROLES.boarder]
        }
      })

      .state('tab.give', {
        url: 'tab/give',
        views: {
          'give-tab': {
            templateUrl: 'templates/tabs/give.html',
            controller: 'giveTabCtrl'
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.boarder]
        }
      });
    $urlRouterProvider.otherwise('/login');
  })

  .config(function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
  });

/*
 .run(function ($httpBackend) {
 $httpBackend.whenGET('http://localhost:8100/valid')
 .respond({message: 'This is my valid response!'});


 $httpBackend.whenGET('api/v1/take/info')
 .respond(
 {
 last_sync_time: null,
 meals: {
 b: {
 b_offer_room: null,
 b_sec_left: 65,
 b_q_today: null,
 b_q_tomorrow: null
 },
 l: {
 l_offer_room: null,
 l_sec_left: null,
 l_q_today: null,
 l_q_tomorrow: null
 },
 d: {
 d_offer_room: null,
 d_sec_left: null,
 d_q_today: null,
 d_q_tomorrow: null
 }
 },
 priority: {
 b: [],
 l: [],
 d: []
 }
 });

 $httpBackend.whenGET('http://localhost:8100/notauthenticated')
 .respond(401, {message: "Not Authenticated"});

 $httpBackend.whenGET('http://localhost:8100/notauthorized')
 .respond(403, {message: "Not Authorized"});
 */
//$httpBackend.whenGET(/templates\/\w+.*/).passThrough();
//})
