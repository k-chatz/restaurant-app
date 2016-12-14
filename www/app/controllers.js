angular.module('restaurant.controllers', [])

  .controller('mainCtrl', function ($scope, $state, $ionicPopup, User, AUTH_EVENTS) {
    console.info("Controller execute: mainCtrl'");

    $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
      $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      }).then(function () {

      });
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      }).then(function () {
        User.doLogout();
        $state.go('login');
      });
    });

    /*TODO: Add watchers to disable/enable this tabs*/
    $scope.menuTabActive = true;
    $scope.takeTabActive = true;

    /*False if user isn't boarder*/
    $scope.giveTabActive = true;
  })

  /*User*/
  .controller('loginCtrl', function ($scope, $state, User, Status) {
    console.info("Controller execute: loginCtrl");

    $scope.login = function () {
      User.doLogin().then(function (data) {
        Status.start(5000);
        $state.go('tab.menu');
      }, function (f) {
        $scope.status = f;
      })
    };


  })



  /*Tab Controllers*/
  .controller('menuTabCtrl', function ($scope, $state, $http, $ionicPopup, Status) {
    console.info("Controller execute: menuTabCtrl");

    $scope.status = {
      time: null,
      meals: {
        b: {
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        l: {
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        d: {
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        }
      },
      priority: {
        b: [],
        l: [],
        d: []
      }
    };

    $scope.$on('$ionicView.enter', function (e) {
      watcher = $scope.$watch(function () {
        return Status.data;
      }, function (data) {
        if (data.time != null && data.success != false) {
          $scope.status = data;
          progress($scope.status.meals.b.sec_left, $scope.status.meals.l.sec_left, $scope.status.meals.d.sec_left);
        }
      }, true);
    });

    $scope.$on('$ionicView.leave', function (e) {
      console.info('$ionicView.leave');
      watcher();
    });

  })

  .controller('takeTabCtrl', ['$rootScope', '$scope', '$interval', '$stateParams', 'Status', 'Take',
    function ($rootScope, $scope, $interval, $stateParams, Status, Take) {
      console.info("Controller execute: takeTabCtrl");
      var watcher = null;
      $scope.status = {
        time: null,
        meals: {
          b: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            o_today: null,
            o_tomorrow: null,
            offers: null
          },
          l: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            o_today: null,
            o_tomorrow: null,
            offers: null
          },
          d: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            o_today: null,
            o_tomorrow: null,
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

      $scope.$on('$ionicView.enter', function (e) {
        watcher = $scope.$watch(function () {
          return Status.data;
        }, function (data) {
          if (data.time != null && data.success != false) {
            $scope.status = data;
            progress($scope.status.meals.b.sec_left, $scope.status.meals.l.sec_left, $scope.status.meals.d.sec_left);
          }
        }, true);
      });
      $scope.$on('$ionicView.leave', function (e) {
        console.info('$ionicView.leave');
        watcher();
      });
      $scope.$on('$ionicView.loaded', function (e) {
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

  .controller('giveTabCtrl', ['$rootScope', '$scope', '$interval', '$stateParams', 'Status', 'Give',
    function ($rootScope, $scope, $interval, $stateParams, Status, Give) {
      console.info("Controller execute: giveTabCtrl");
      var watcher = null;
      $scope.status = {
        time: null,
        meals: {
          b: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          },
          l: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          },
          d: {
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          }
        },
        priority: {
          b: [],
          l: [],
          d: []
        },
        offersByDate: []
      };
      /*Give buttons*/
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
      $scope.$on('$ionicView.enter', function (e) {
        watcher = $scope.$watch(function () {
          return Status.data;
        }, function (data) {
          if (data.time != null && data.success != false) {
            $scope.status = data;
            $scope.offersByDate = $scope.status.offersByDate;
            progress($scope.status.meals.b.sec_left, $scope.status.meals.l.sec_left, $scope.status.meals.d.sec_left);
          }
        }, true);
      });
      $scope.$on('$ionicView.leave', function (e) {
        console.info('$ionicView.leave');
        watcher();
      });
      $scope.$on('$ionicView.loaded', function (e) {
        console.info('$ionicView.loaded');
      });
      $scope.offer = function (meal) {
        Give.offer(meal).then(function (response) {
          Status.refresh();
        });
      };
      $scope.cancel = function (meal) {
        Give.cancel(meal).then(function (response) {
          Status.refresh();
        });
      };
      $scope.confirm = function (meal, status, date) {
          var status = (status == null ? -1 : status);
          Give.confirm(meal, status, date).then(function (response) {
            Status.refresh();
          });
      };
      $scope.reject = function (meal) {
        Give.reject(meal).then(function (response) {
          Status.refresh();
        });
      };

      /*Give more..*/
      $scope.offersByDate = [];
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
        selectedDates: $scope.offersByDate,
        disablepreviousdates: true,
        conflictSelectedDisabled: 'DISABLED', // SELECTED | DISABLED
        closeOnSelect: false,
        mondayFirst: true,
        weekDaysList: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
        monthList: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        callback: setMoreOffer
      };

      function setMoreOffer(dates){
        $scope.offersByDate.length = 0;
        for (var i = 0; i < dates.length; i++) {
          $scope.offersByDate.push(angular.copy(dates[i]));
        }
      }

    }])

  /*Other*/

  .controller('helpCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: helpCtrl");

    }])

  .controller('aboutCtrl', ['$scope', '$stateParams',
  function ($scope, $stateParams) {
    console.info("Controller execute: aboutCtrl");

  }]);















  /*Navigator*/
  .controller('menuCtrl', ['$scope', '$stateParams', '$state', 'User', function ($scope, $stateParams, $state, User) {
    console.info("Controller execute: menuCtrl");

    $scope.showLogOutMenu = function () {
      User.doLogout().then(function (s) {

        $scope.s = s;
      }, function (f) {
        $scope.f = f;
      });
      $state.go('login');
    }

  }])


  /*Other*/

  .controller('helpCtrl', function ($scope, $stateParams, Status, User) {
      console.info("Controller execute: helpCtrl");

      $scope.debugLogin = function (token) {
        console.info("Login!");
        User.debugLogin(token);
      };

      $scope.debugLogout = function (token) {
        console.info("Logout!");
        User.debugLogout();
      };

      $scope.start = function () {
        console.info("Start Timer");
        Status.start(5000);
      };

      $scope.stop = function () {
        console.info("Stop Timer");
        Status.stop();
      };


    })

  .controller('aboutCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: aboutCtrl");

    }]);
