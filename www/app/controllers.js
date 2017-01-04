angular.module('restaurant.controllers', [])


  .controller('mainCtrl', function ($rootScope, $scope, $state, $cordovaToast, User, AUTH_EVENTS) {
    console.info("Controller execute: mainCtrl'");

    //ionic.Platform.exitApp(); // stops the app

    $scope.$on('processing', function (event, v) {
      $scope.processing = v.status;
    });

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event, message) {
      $cordovaToast.show('Forbidden!\n' + message, 'long', 'center');
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event, message) {
      $cordovaToast.show('Session expired!\nYou have to login again...', 'long', 'center').then(function () {
        User.doLogout().then(function () {
          $state.go('login');
        });
      });
    });

    $scope.$on(AUTH_EVENTS.internalServerError, function (event, message) {
      $cordovaToast.show('Internal Server Error!\n' + message, 'long', 'center');
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
          $state.go('tab.menu').then(function () {
            if (User.isNew()) {
              $cordovaToast.show('Your registration was completed successfully!\n\nWelcome :)', 'long', 'center');
            }
          });
        }, function (error) {
          $cordovaToast.show('Oops something went wrong!\n'+ error.errorMessage +'\n\nPlease try again later...', 'long', 'center');
        })
      }
      else {
        $cordovaToast.show('No internet connection!', 'long', 'center');
      }
    };
  })

  /*Tab Controllers*/
  .controller('menuTabCtrl', function ($scope, $state, $ionicTabsDelegate, $http, $ionicPopup, Status, Menu, Take, Give) {
    console.info("Controller execute: menuTabCtrl");

    $scope.goForward = function () {
      var selected = $ionicTabsDelegate.selectedIndex();
      if (selected != -1) {
        $ionicTabsDelegate.select(selected + 1);
      }
    };

    $scope.goBack = function () {
      var selected = $ionicTabsDelegate.selectedIndex();
      if (selected != -1 && selected != 0) {
        $ionicTabsDelegate.select(selected - 1);
      }
    };


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

      Menu.breakfast().then(function (data) {
        $scope.breakfast = data.menu.meal;
      }, function (error) {
        $scope.breakfast = error.message;
      });

      Menu.lunch().then(function (data) {
        $scope.lunch = data.menu.meal;
      }, function (error) {
        $scope.lunch = error.message;
      });

      Menu.dinner().then(function (data) {
        $scope.dinner = data.menu.meal;
      }, function (error) {
        $scope.dinner = error.message;
      });

      watcher = $scope.$watch(function () {
        return Status.data;
      }, function (data) {
        if (data.time != null && data.success != false) {
          $scope.status = data;
        }
      }, true);
    });

    $scope.$on('$ionicView.leave', function (e) {
      console.info('$ionicView.leave');
      watcher();
    });

    $scope.question = function (meal) {
      Take.question(meal).then(function (response) {
        Status.refresh();
      });
    };

    $scope.offer = function (meal) {
      Give.offer(meal).then(function (response) {
        Status.refresh();
      });
    };

  })


  .controller('takeTabCtrl', ['$rootScope', '$scope', '$ionicTabsDelegate', '$interval', '$stateParams', 'Status', 'Take',
    function ($rootScope, $scope, $ionicTabsDelegate, $interval, $stateParams, Status, Take) {
      console.info("Controller execute: takeTabCtrl");

      $scope.goForward = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1) {
          $ionicTabsDelegate.select(selected + 1);
        }
      };

      $scope.goBack = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
          $ionicTabsDelegate.select(selected - 1);
        }
      };


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


  .controller('giveTabCtrl', ['$rootScope', '$scope', '$ionicTabsDelegate', '$cordovaToast', '$interval', '$stateParams', 'User', 'Status', 'Give',
    function ($rootScope, $scope, $ionicTabsDelegate, $cordovaToast, $interval, $stateParams, User, Status, Give) {
      console.info("Controller execute: giveTabCtrl");

      $scope.goForward = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1) {
          $ionicTabsDelegate.select(selected + 1);
        }
      };

      $scope.goBack = function () {
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
          $ionicTabsDelegate.select(selected - 1);
        }
      };


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
  .controller('menuCtrl', function ($rootScope, $scope, $stateParams, $cordovaActionSheet, $cordovaNetwork, $cordovaToast, $state, User) {
    console.info("Controller execute: menuCtrl");

    var watcher = $scope.$watch(function () {
      return User.isAuthenticated();
    }, function (is) {
      $scope.isLoggedIn = is;
    }, true);

    $scope.showLogOutMenu = function () {

      /*Show logout confirm dialog*/
      document.addEventListener("deviceready", function () {
        if ($cordovaNetwork.isOnline()) {
          var options = {
            title: 'Are you sure you want to Sign-Out ?',
            buttonLabels: ['Yes', 'No']
          };

          $cordovaActionSheet.show(options)
            .then(function (btnIndex) {
              if (btnIndex == 1) {
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
            });
        }
        else {
          $cordovaToast.show('No internet connection found!', 'long', 'center');
        }
      }, false);
    }
  })


  /*Other*/

  .controller('helpCtrl', function (envService, $http, $rootScope, $ionicPopup, $scope, $cordovaBarcodeScanner, $cordovaDevice, $cordovaFlashlight, $cordovaVibration, $stateParams, Status, User, $cordovaDialogs, $ionicPlatform, $cordovaLocalNotification, $cordovaNetwork, $cordovaToast) {
    console.info("Controller execute: helpCtrl");

    $scope.$on('$ionicView.enter', function (e) {
      $scope.dev_token_data = null;
      $http({
        method: 'GET',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + '/user/token/data',
        headers: {'Content-Type': 'application/json'},
        timeout: envService.read('timeout')
      }).then(function (success) {
        $scope.dev_token_data = success.data;
      }, function (fail) {
        $scope.dev_token_data = fail.data;
      });
    });

    $scope.showPopup = function () {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.number"><input type="password" ng-model="data.number">',
        title: 'Enter your food card number',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.number) {
                //don't allow the user to close unless he enters a text
                e.preventDefault();
              } else {
                return $scope.data.number;
              }
            }
          }
        ]
      });

      myPopup.then(function (res) {
        alert(res);
      });


    };


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

    $scope.beep = function () {
      $cordovaDialogs.beep(3);
    };

    $scope.confirm = function () {
      $cordovaDialogs.confirm('message', 'title', ['button 1', 'button 2'])
        .then(function (buttonIndex) {
          alert(buttonIndex);
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

    $scope.vibration = function () {
      $cordovaVibration.vibrate(5000);
    }

    $scope.Flashavailable = function () {
      $cordovaFlashlight.available().then(function (availability) {
        $scope.flashavail = availability; // is available
      }, function () {
        $scope.flashavail = null;
      });
    }

    $scope.FlashswitchOn = function () {
      $cordovaFlashlight.switchOn().then(
        function (success) { /* success */
        },
        function (error) { /* error */
        });
    }

    $scope.FlashswitchOff = function () {
      $cordovaFlashlight.switchOff()
        .then(
          function (success) { /* success */
          },
          function (error) { /* error */
          });
    }

    $scope.Flashtoggle = function () {
      $cordovaFlashlight.toggle()
        .then(function (success) { /* success */
          },
          function (error) { /* error */
          });
    }


    document.addEventListener("deviceready", function () {

      $scope.device = $cordovaDevice.getDevice();

      $scope.cordova = $cordovaDevice.getCordova();

      $scope.model = $cordovaDevice.getModel();

      $scope.platform = $cordovaDevice.getPlatform();

      $scope.uuid = $cordovaDevice.getUUID();

      $scope.version = $cordovaDevice.getVersion();


      $scope.scan = function () {
        $cordovaBarcodeScanner.scan()
          .then(function (barcodeData) {
            if (!barcodeData.cancelled && barcodeData.format == 'QR_CODE') {
              alert(barcodeData.text);
            }
          }, function (error) {
            //alert(JSON.stringify(error));
          });
      };
    }, false);

  })

  .controller('settingsCtrl', ['$scope', '$state', '$stateParams', '$cordovaToast', '$cordovaActionSheet', '$cordovaNetwork', '$cordovaBarcodeScanner', 'base64', 'User', 'Status',
    function ($scope, $state, $stateParams, $cordovaToast, $cordovaActionSheet, $cordovaNetwork, $cordovaBarcodeScanner, base64, User, Status) {
      console.info("Controller execute: settingsCtrl");

      $scope.$on('$ionicView.enter', function (e) {
        $scope.cardNumber = User.number();
      });

      $scope.insertCardNumber = function () {
        $cordovaBarcodeScanner.scan()
          .then(function (barcodeData) {
            if (!barcodeData.cancelled && barcodeData.format == 'QR_CODE') {
              User.doInsertNumber(barcodeData.text).then(function (number) {
                if (number !== null) {
                  $cordovaToast.show('Success! Your card number (' + number + ') was inserted successfully', 'long', 'bottom');
                  $scope.cardNumber = User.number();
                }
                else{
                  $cordovaToast.show('Fail!', 'long', 'bottom');
                }
              });
            }
          });
      };

      $scope.deleteAccount = function () {
        /*Show logout confirm dialog*/
        document.addEventListener("deviceready", function () {
          if ($cordovaNetwork.isOnline()) {
            var options = {
              title: 'Danger: This action will delete permanently your account and all questions - offers you have , proceed ?',
              buttonLabels: ['Yes', 'No']
            };
            $cordovaActionSheet.show(options)
              .then(function (btnIndex) {
                if (btnIndex == 1) {
                  if (User.isAuthenticated()) {
                    Status.stop();
                    User.doDelete().then(function (s) {
                      if (s.fbDelinking == true && s.userDeleted == 1) {
                        User.doLogout().then(function (s) {
                          $state.go('login').then(function () {
                            $cordovaToast.show('Your facebook delinking and your account deletion was successfully done.\n\nGood bye user :(', 'long', 'center');
                          });
                        });
                      } else {
                        alert("Please try again later..");
                      }
                    }, function (f) {
                      $cordovaToast.show('Oops something went wrong!\nPlease try again later...', 'long', 'center');
                    })
                  } else {
                    $cordovaToast.show('You must login first to delete your account', 'long', 'center');
                  }
                }
              });
          }
          else {
            $cordovaToast.show('No internet connection found!', 'long', 'center');
          }
        }, false);
      }
    }])

  .controller('aboutCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
      console.info("Controller execute: aboutCtrl");

    }]);
