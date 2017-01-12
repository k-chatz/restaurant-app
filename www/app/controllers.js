angular.module('restaurant.controllers', [])


  .controller('mainCtrl', function ($rootScope, $scope, $state, $cordovaToast, Status, User, AUTH_EVENTS) {
    console.info("Controller execute: mainCtrl'");

    //ionic.Platform.exitApp(); // stops the app

    if (User.isAuthenticated()) {
      Status.start(10000);
    }

    $scope.$on('userIsAuthenticated', function (event, is) {
      if (is) {
        Status.start(10000);
      }
      else {
        Status.stop();
      }
    });

    $scope.$on('processing', function (event, v) {
      $scope.processing = v.status;
    });

    $scope.$on(AUTH_EVENTS.badRequest, function (event, data) {
      $cordovaToast.show('..::Bad Request::..\n' + data.error.message, 'long', 'center');
    });

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event, data) {
      $cordovaToast.show('..::Forbidden::..\n' + data.error.message, 'long', 'center');
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event, data) {
      $cordovaToast.show('..::Not Authenticated::..\n' + data.error.message + '\n\nYour session expired, you have to login again...', 'long', 'center').then(function () {
        User.doLogout().then(function () {
          $state.go('login');
        });
      });
    });

    $scope.$on(AUTH_EVENTS.internalServerError, function (event, data) {
      $cordovaToast.show('..::Internal Server Error::..\n' + data.error.message, 'long', 'center');
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
          $cordovaToast.show('Oops something went wrong!\n' + error.errorMessage + '\n\nPlease try again later...', 'long', 'center');
        })
      }
      else {
        $cordovaToast.show('No internet connection!', 'long', 'center');
      }
    };
  })

  /*Tab Controllers*/
  .controller('menuTabCtrl', function ($rootScope, $scope, $state, $ionicTabsDelegate, Status, Menu, Take, Give) {
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

    var watcher = null;

    $scope.status = {
      time: null,
      meals: {
        b: {
          progress: null,
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        l: {
          progress: null,
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        d: {
          progress: null,
          o_number: null,
          sec_left: null,
          q_question: null,
          q_username: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        }
      },
      menu: {
        b:{
          meal: null,
          date: null
        },
        l:{
          meal: null,
          date: null
        },
        d:{
          meal: null,
          date: null
        }
      }
    };

    $scope.$on('$ionicView.enter', function (e) {
      Status.view('menu');
      watcher = $scope.$watch(function () {
        return Status.data;
      }, function (data) {
        $scope.status = data;
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

  .controller('takeTabCtrl', ['$rootScope', '$scope', '$state', '$ionicTabsDelegate', '$stateParams', 'Status', 'Take',
    function ($rootScope, $scope, $state, $ionicTabsDelegate, $stateParams, Status, Take) {
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
            progress: null,
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            o_today: null,
            o_tomorrow: null,
            offers: null
          },
          l: {
            progress: null,
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            o_today: null,
            o_tomorrow: null,
            offers: null
          },
          d: {
            progress: null,
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
        Status.view('take');
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
            progress: null,
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          },
          l: {
            progress: null,
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          },
          d: {
            progress: null,
            o_number: null,
            sec_left: null,
            q_question: null,
            q_username: null,
            questions: null,
            o_offer: null,
            offers: null
          }
        },
        offersByDate: []
      };
      /*Give buttons*/

      $scope.$on('$ionicView.enter', function (e) {
        Status.view('give');
        watcher = $scope.$watch(function () {
          return Status.data;
        }, function (data) {
          if (data.time != null && data.success != false) {
            $scope.status = data;
            $scope.offersByDate = $scope.status.offersByDate;
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

  .controller('helpCtrl', function ($scope, $stateParams) {
    console.info("Controller execute: helpCtrl");

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
                else {
                  $cordovaToast.show('Fail!', 'long', 'center');
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
