angular.module('restaurant.controllers', [])

  .controller('mainCtrl', function ($rootScope, $interval, $scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, Status) {
    console.info("Controller execute: mainCtrl'");
    $scope.username = AuthService.username();

    Status.start(5000);

    $scope.menuTabActive = true;
    $scope.takeTabActive = true;
    $scope.giveTabActive = true;
    /*False if user isn't boarder*/

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


  .controller('menuCtrl', ['$scope', '$stateParams', 'UserService', '$ionicActionSheet', '$state', '$ionicLoading',
    function ($scope, $stateParams, UserService, $ionicActionSheet, $state, $ionicLoading) {
      console.info("Controller execute: menuCtrl");

      $scope.showLogOutMenu = function() {
        console.info("Logout menu button clicked!");
        var hideSheet = $ionicActionSheet.show({
          destructiveText: 'Logout',
          titleText: '<h4><strong>Are you sure you want to logout?</strong></h4> ' +
          '<p>If you disconnect, you will not be able to receive notifications for any news!</p>',
          cancelText: 'Cancel',
          cancel: function() {},
          buttonClicked: function(index) {
            return true;
          },
          destructiveButtonClicked: function(){
            $ionicLoading.show({
              template: 'Logging out...'
            });

            //facebook logout
            facebookConnectPlugin.logout(function(){
                $ionicLoading.hide();
                $state.go('/login');
              },
              function(fail){
                $ionicLoading.hide();
              });
          }
        });
      };

    }])


  .controller('loginCtrl', function ($scope, $state, $q, UserService, $ionicLoading) {
    console.info("Controller execute: loginCtrl");


    //This is the success callback from the login method
    var fbLoginSuccess = function(response) {
      if (!response.authResponse){
        fbLoginError("Cannot find the authResponse");
        return;
      }

      var authResponse = response.authResponse;

      getFacebookProfileInfo(authResponse)
        .then(function(profileInfo) {
          //for the purpose of this example I will store user data on local storage
          UserService.setUser({
            authResponse: authResponse,
            userID: profileInfo.id,
            name: profileInfo.name,
            email: profileInfo.email,
            picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
          });

          $ionicLoading.hide();
          $state.go('tab.menu');

        }, function(fail){
          //fail get profile info
          console.log('profile info fail', fail);
        });
    };


    //This is the fail callback from the login method
    var fbLoginError = function(error){
      console.log('fbLoginError', error);
      $ionicLoading.hide();
    };

    //this method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
      var info = $q.defer();

      facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
        function (response) {
          console.log(response);
          info.resolve(response);
        },
        function (response) {
          console.log(response);
          info.reject(response);
        }
      );
      return info.promise;
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {

      facebookConnectPlugin.getLoginStatus(function(success){
        if(success.status === 'connected'){
          // the user is logged in and has authenticated your app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed request, and the time the access token
          // and signed request each expire
          console.log('getLoginStatus', success.status);

          //check if we have our user saved
          var user = UserService.getUser('facebook');

          if(!user.userID)
          {
            getFacebookProfileInfo(success.authResponse)
              .then(function(profileInfo) {

                //for the purpose of this example I will store user data on local storage
                UserService.setUser({
                  authResponse: success.authResponse,
                  userID: profileInfo.id,
                  name: profileInfo.name,
                  email: profileInfo.email,
                  picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                });

                $state.go('app.home');

              }, function(fail){
                //fail get profile info
                console.log('profile info fail', fail);
              });
          }else{
            $state.go('app.home');
          }

        } else {
          //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
          //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
          console.log('getLoginStatus', success.status);

          $ionicLoading.show({
            template: 'Logging in...'
          });

          //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
          facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
        }
      });
    };


  })



  /*Tab Controllers*/
  .controller('menuTabCtrl', function ($scope, $state, $http, $ionicPopup, AuthService, Status, UserService, $ionicLoading, $ionicActionSheet) {
    console.info("Controller execute: menuTabCtrl");


    $scope.user = UserService.getUser();

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





























