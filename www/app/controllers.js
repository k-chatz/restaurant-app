angular.module('restaurant.controllers', [])

  .controller('mainCtrl', function ($rootScope, $interval, $scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, Status) {
    console.info("Controller execute: mainCtrl'");
    $scope.username = AuthService.username();

    Status.start(1000);

    $scope.menuTabActive = true;
    $scope.takeTabActive = true;
    $scope.giveTabActive = true; /*False if user isn't boarder*/

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      });
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
      AuthService.logout();
      $state.go('login');
      var alertPopup = $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      });
    });

    $scope.setCurrentUsername = function (name) {
      $scope.username = name;
    };

  })

  .controller('menuCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: menuCtrl");

    }])

  .controller('aboutCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: aboutCtrl");

    }])

  .controller('registerCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: registerCtrl");

    }])

  .controller('loginCtrl', function ($scope, $state, $ionicPopup, AuthService) {
    console.info("Controller execute: loginCtrl");
    $scope.data = {};

    $scope.login = function (data) {
      AuthService.login(data.username, data.password).then(function (authenticated) {
        $state.go('tab.menu', {}, {reload: true});
        $scope.setCurrentUsername(data.username);
      }, function (err) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
    };
  })

  .controller('menuTabCtrl', function ($scope, $state, $http, $ionicPopup, AuthService) {
    console.info("Controller execute: menuTabCtrl");
    $scope.logout = function () {
      AuthService.logout();
      $state.go('login');
    };

    $scope.performValidRequest = function () {
      $http.get('http://localhost:8100/valid').then(
        function (result) {
          $scope.response = result;
        });
    };

    $scope.performUnauthorizedRequest = function () {
      $http.get('http://localhost:8100/notauthorized').then(
        function (result) {
          // No result here..
        }, function (err) {
          $scope.response = err;
        });
    };

    $scope.performInvalidRequest = function () {
      $http.get('http://localhost:8100/notauthenticated').then(
        function (result) {
          // No result here..
        }, function (err) {
          $scope.response = err;
        });
    };

  })

  .controller('takeTabCtrl', ['$rootScope', '$scope', '$interval', '$stateParams', 'Status', 'Take',
    function ($rootScope, $scope, $interval, $stateParams, Status, Take) {
      console.info("Controller execute: takeTabCtrl");

      $scope.status = {
        time: null,
        meals: {
          b: {
            o_number: null,
            sec_left: null,
            progress: 100,
            q_today: null,
            q_tomorrow: null,
            offers: null
          },
          l: {
            o_number: null,
            sec_left: null,
            progress: 100,
            q_today: null,
            q_tomorrow: null,
            offers: null
          },
          d: {
            o_number: null,
            sec_left: null,
            progress: 100,
            q_today: null,
            q_tomorrow: null,
            offers: null
          }
        },
        priority: {
          b: [],
          l: [],
          d: []
        }
      };

      function progress(B, L, D) {
        var day_duration = 86400;
        var b_duration = 5400;
        var l_duration = 9000;
        var d_duration = 6301;
        var b = ((b_duration - (B <= 0 ? B + day_duration : B) ) / b_duration) * 100;
        var l = ((l_duration - (L <= 0 ? L + day_duration : L) ) / l_duration) * 100;
        var d = ((d_duration - (D <= 0 ? D + day_duration : D) ) / d_duration) * 100;
        $scope.status.meals.b.progress = b < 0 ? 0 : b;
        $scope.status.meals.l.progress = l < 0 ? 0 : l;
        $scope.status.meals.d.progress = d < 0 ? 0 : d;
      }

      $scope.$on('$ionicView.enter', function(e) {
        $scope.$watch(function () { return Status.data; }, function (data){
          if (data.time != null && data.success != false) {
            $scope.status = data;
            progress($scope.status.meals.b.sec_left, $scope.status.meals.l.sec_left, $scope.status.meals.d.sec_left);
          }
        }, true);
      });


      $scope.$on('$ionicView.leave', function(e) {
        console.info('$ionicView.leave');
      });


      $scope.$on('$ionicView.loaded', function(e) {
        console.info('$ionicView.loaded');
      });


      $scope.question = function (meal) {
        Take.question(meal).then(function (response) {
          Status.refresh();
        });
      };

      $scope.cancel = function (meal) {
        Take.cancel(meal).then(function (response) {
          Status.refresh();
        });
      };

      $scope.confirm = function (meal) {
        Take.confirm(meal).then(function (response) {
          Status.refresh();
        });
      };

      $scope.reject = function (meal) {
        Take.reject(meal).then(function (response) {
          Status.refresh();
        });
      };
    }])

  .controller('giveTabCtrl', ['$scope', '$timeout', '$stateParams', function ($scope, $timeout, $stateParams) {
    console.info("Controller execute: giveTabCtrl");

    $scope.selectedDates = [];

    var startDate = new Date();
    var endDate = new Date();
    var monthRange = 1;
    endDate.setMonth(startDate.getMonth() + monthRange);

    $scope.datepickerObject = {
      templateType: 'MODAL', // POPUP | MODAL
      modalFooterClass: 'bar-light',
      //header: 'multi-date-picker',
      headerClass: 'royal-bg light',

      btnsIsNative: true,

      btnOk: 'OK',
      btnOkClass: 'button-clear cal-green',

      btnCancel: 'Close',
      btnCancelClass: 'button-clear button-dark',

      //btnTodayShow: true,
      btnToday: 'Today',
      btnTodayClass: 'button-clear button-dark',

      //btnClearShow: true,
      btnClear: 'Clear',
      btnClearClass: 'button-clear button-dark',

      selectType: 'MULTI', // SINGLE | PERIOD | MULTI

      tglSelectByWeekShow: false, // true | false (default)
      tglSelectByWeek: 'By week',
      isSelectByWeek: true, // true (default) | false
      selectByWeekMode: 'NORMAL', // INVERSION (default), NORMAL
      tglSelectByWeekClass: 'toggle-positive',
      titleSelectByWeekClass: 'positive positive-border',

      accessType: 'WRITE', // READ | WRITE
      showErrors: true, // true (default), false
      errorLanguage: 'EN',
      fromDate: startDate,
      toDate: endDate,
      selectedDates: $scope.selectedDates,
      disablepreviousdates: true,
      conflictSelectedDisabled: 'DISABLED', // SELECTED | DISABLED
      closeOnSelect: false,
      mondayFirst: true,
      weekDaysList: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      monthList: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      callback: function (dates) {
        $scope.selectedDates.length = 0;
        for (var i = 0; i < dates.length; i++) {
          $scope.selectedDates.push(angular.copy(dates[i]));
        }
      }
    };

    $scope.give = {};
    $scope.give.b = true;
    $scope.give.l = true;
    $scope.give.d = true;


  }]);
































