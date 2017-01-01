angular.module('restaurant', [
  'ionic',
  'ngCordova',
  'ngMaterial',
  'ui.router',
  'restaurant.config',
  'restaurant.controllers',
  'restaurant.filters',
  'restaurant.directives',
  'restaurant.services',
  'ionic-multi-date-picker',
  'environment',
  'angular-jwt'])

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

  .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/forms/login.html',
        controller: 'loginCtrl'
      })

      .state('help', {
        url: '/help',
        templateUrl: 'templates/help.html',
        controller: 'helpCtrl'
      })

      .state('about', {
        url: '/about',
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      })

      /*Tab states*/
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
      })

      .state('settings', {
        url: '/settings',
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.visitor, USER_ROLES.boarder]
        }
      })

    $urlRouterProvider.otherwise('/login');
  })

  .run(function ($rootScope, $state, User, Status, AUTH_EVENTS, $cordovaToast) {
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
      if ('data' in next && 'authorizedRoles' in next.data) {
        var authorizedRoles = next.data.authorizedRoles;
        if (!User.isAuthorized(authorizedRoles)) {
          event.preventDefault();
          $state.go($state.current, {}, {reload: true});
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized, "Login first!");
        }
      }

      if (!User.isAuthenticated()) {
        Status.stop();
        if (["login", "help", "about"].indexOf(next.name) == -1) {
          event.preventDefault();
          $state.go('login');
        }
      }
      else {
        Status.start(10000);
        if (next.name == 'login') {
          event.preventDefault();
          $state.go('tab.menu');
          $cordovaToast.showShortCenter('Already Sign-In!');
        }
      }
    });
  })

  .config(function ($httpProvider, envServiceProvider) {
    $httpProvider.defaults.useXDomain = true;

    envServiceProvider.config({
      domains: {
        development: ['localhost'],
        production: ['83.212.118.209']
      },
      vars: {
        development: {
          apiUrl: 'http://192.168.1.3/ionic/Restaurant-API',
          userDoConnectPath: '/user/do/connect',
          userDoDelinkPath: '/user/do/delink',
          menuPath: '/menu',
          statusInfoPath: '/status/info',
          takeQuestionPath: '/take/question',
          takeCancelPath: '/take/cancel',
          takeConfirmPath: '/take/confirm',
          takeRejectPath: '/take/reject',
          giveOfferPath: '/give/offer',
          giveOffersPath: '/give/offers',
          giveCancelPath: '/give/cancel',
          giveConfirmPath: '/give/confirm',
          giveRejectPath: '/give/reject',
          timeout: 5000
        },
        production: {
          apiUrl: 'http://83.212.118.209/Restaurant-API',
          userDoConnectPath: '/user/do/connect',
          userDoDelinkPath: '/user/do/delink',
          menuPath: '/menu',
          statusInfoPath: '/status/info',
          takeQuestionPath: '/take/question',
          takeCancelPath: '/take/cancel',
          takeConfirmPath: '/take/confirm',
          takeRejectPath: '/take/reject',
          giveOfferPath: '/give/offer',
          giveOffersPath: '/give/offers',
          giveCancelPath: '/give/cancel',
          giveConfirmPath: '/give/confirm',
          giveRejectPath: '/give/reject',
          timeout: 20000
        }
      }
    });
    envServiceProvider.check();

    envServiceProvider.set('production');

  });
