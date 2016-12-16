angular.module('restaurant.controllers', [])

  .controller('mainCtrl', function ($rootScope, $scope, $state, $cordovaToast, User, AUTH_EVENTS) {
    console.info("Controller execute: mainCtrl'");

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
      $cordovaToast.show('Unauthorized: You are not allowed to access this resource!', 'long', 'center');
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
      $cordovaToast.show('Session Lost: Sorry, You have to login again!', 'long', 'center').then(function () {
        User.doLogout().then(function () {
          $state.go('login');
        });
      });
    });

    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
      $cordovaToast.show('The Internet connection is lost!', 'long', 'center');
    });

    /*TODO: USER SERVICE->GET_ROLE() Add watchers to disable/enable this tabs*/
    $scope.menuTabActive = true;
    $scope.takeTabActive = true;

    /*False if user isn't boarder*/
    $scope.giveTabActive = true;

  })

  /*User*/
  .controller('loginCtrl', function ($rootScope, $cordovaToast, $cordovaNetwork, $scope, $state, User) {
    console.info("Controller execute: loginCtrl");

    $scope.login = function () {
      if ($cordovaNetwork.isOnline()) {
        User.doLogin().then(function (data) {
          $state.go('tab.menu');
          if(User.isNew()) {
            $cordovaToast.show('Your registration was completed successfully. Welcome!', 'long', 'center');
          }
        }, function (data) {
          /*TODO: error in toast message*/
          $cordovaToast.show('Connect fail! Error: ' + data.error.message, 'long', 'center');
        })
      }
      else {
        $cordovaToast.show('No internet connection found!', 'long', 'center');
      }
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

      function setMoreOffer(dates) {
        $scope.offersByDate.length = 0;
        for (var i = 0; i < dates.length; i++) {
          $scope.offersByDate.push(angular.copy(dates[i]));
        }
      }

    }])


  /*Navigator*/
  .controller('menuCtrl', function ($scope, $stateParams, $cordovaNetwork, $cordovaToast, $state, User) {
    console.info("Controller execute: menuCtrl");

    $scope.showLogOutMenu = function () {

      /*TODO: Show logout menu*/

      if ($cordovaNetwork.isOnline()) {
        if (User.isAuthenticated()) {
          User.doLogout().then(function (s) {
            $state.go('login').then(function () {
              $cordovaToast.show('Sign-Out successfully!', 'long', 'center');
            });
          }, function (f) {
            $cordovaToast.show('Sign-Out failed!', 'long', 'center');
          });
        } else {
          $cordovaToast.show('Already Sign-Out!', 'long', 'center');
        }
      }
      else {
        $cordovaToast.show('No internet connection found!', 'long', 'center');
      }
    }

  })


  /*Other*/

  .controller('helpCtrl', function ($rootScope, $scope, $stateParams, Status, User, $cordovaDialogs, $ionicPlatform, $cordovaLocalNotification, $cordovaNetwork, $cordovaToast) {
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
      Status.start(1000);
    };

    $scope.stop = function () {
      console.info("Stop Timer");
      Status.stop();
    };

    $scope.beep = function () {
      $cordovaDialogs.beep(3);
    };

    $scope.confirm = function () {
      $cordovaDialogs.confirm('message', 'title', ['button 1', 'button 2'])
        .then(function (buttonIndex) {
          // no button = 0, 'OK' = 1, 'Cancel' = 2
          var btnIndex = buttonIndex;
        });
    };

    $scope.prompt = function () {
      $cordovaDialogs.prompt('Enter your card number', 'Card Number', ['btn 1', 'btn 2'], 'default text')
        .then(function (result) {
          var input = result.input1;
          // no button = 0, 'OK' = 1, 'Cancel' = 2
          var btnIndex = result.buttonIndex;
        });
    }

    $ionicPlatform.ready(function () {

      // ========== Scheduling

      $scope.scheduleSingleNotification = function () {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Restaurant',
          text: 'Number found!',
          data: {
            customProperty: 'custom value'
          }
        }).then(function (result) {
          //alert(result);
        });
      };

      $scope.scheduleMultipleNotifications = function () {
        $cordovaLocalNotification.schedule([
          {
            id: 1,
            title: 'Title 1 here',
            text: 'Text 1 here',
            data: {
              customProperty: 'custom 1 value'
            }
          },
          {
            id: 2,
            title: 'Title 2 here',
            text: 'Text 2 here',
            data: {
              customProperty: 'custom 2 value'
            }
          },
          {
            id: 3,
            title: 'Title 3 here',
            text: 'Text 3 here',
            data: {
              customProperty: 'custom 3 value'
            }
          }
        ]).then(function (result) {
          // ...
        });
      };

      $scope.scheduleDelayedNotification = function () {
        var now = new Date().getTime();
        var _10SecondsFromNow = new Date(now + 10 * 1000);

        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Title here',
          text: 'Text here',
          at: _10SecondsFromNow
        }).then(function (result) {
          // ...
        });
      };

      $scope.scheduleEveryMinuteNotification = function () {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Title here',
          text: 'Text here',
          every: 'minute'
        }).then(function (result) {
          // ...
        });
      };

      // =========/ Scheduling

      // ========== Update

      $scope.updateSingleNotification = function () {
        $cordovaLocalNotification.update({
          id: 1,
          title: 'Title - UPDATED',
          text: 'Text - UPDATED'
        }).then(function (result) {
          // ...
        });
      };

      $scope.updateMultipleNotifications = function () {
        $cordovaLocalNotification.update([
          {
            id: 1,
            title: 'Title 1 - UPDATED',
            text: 'Text 1 - UPDATED'
          },
          {
            id: 2,
            title: 'Title 2 - UPDATED',
            text: 'Text 2 - UPDATED'
          },
          {
            id: 3,
            title: 'Title 3 - UPDATED',
            text: 'Text 3 - UPDATED'
          }
        ]).then(function (result) {
          // ...
        });
      };

      // =========/ Update

      // ========== Cancelation

      $scope.cancelSingleNotification = function () {
        $cordovaLocalNotification.cancel(1).then(function (result) {
          // ...
        });
      };

      $scope.cancelMultipleNotifications = function () {
        $cordovaLocalNotification.cancel([1, 2]).then(function (result) {
          // ...
        });
      };

      $scope.cancelAllNotifications = function () {
        $cordovaLocalNotification.cancelAll().then(function (result) {
          // ...
        });
      };

      // =========/ Cancelation

      // ========== Events

      $rootScope.$on('$cordovaLocalNotification:schedule',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:trigger',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:update',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:clear',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:clearall',
        function (event, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:cancel',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:cancelall',
        function (event, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:click',
        function (event, notification, state) {
          // ...
        });

      // =========/ Events

    });

    $scope.nettype = function () {
      $scope.net_type = $cordovaNetwork.getNetwork();
    };

    $scope.netisOnline = function () {
      $scope.net_isOnline = $cordovaNetwork.isOnline();
    };

    $scope.netisOffline = function () {
      $scope.net_isOffline = $cordovaNetwork.isOffline();
    };

    $scope.toast = function () {
      $cordovaToast
        .show('Here is a message', 'long', 'center')
        .then(function (success) {
          // success
        }, function (error) {
          // error
        });
    }

    $scope.toast_showShortTop = function () {
      $cordovaToast.showShortTop('Here is a message').then(function (success) {
        // success
      }, function (error) {
        // error
      });
    }

    $scope.toast_showLongBottom = function () {
      $cordovaToast.showLongBottom('Here is a message').then(function (success) {
        // success
      }, function (error) {
        // error
      });
    }


  })

  .controller('aboutCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: aboutCtrl");

    }]);
