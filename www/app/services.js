angular.module('restaurant.services', [])

  .service('Facebook', ['$q', function ($q) {

    /*TODO: Work for android, browser, windows, ios*/

    var service = {};
    service.authResponse = null;
    service.status = status;
    service.login = login;
    service.profile = profile;
    service.logout = logout;
    return service;

    function status() {
      var info = $q.defer();
      facebookConnectPlugin.getLoginStatus(function (s) {
        service.authResponse = s.authResponse;
        info.resolve(s);
      }, function (f) {
        info.reject(f);
      });
      return info.promise;
    }

    function login() {
      var info = $q.defer();
      facebookConnectPlugin.login(['public_profile'], function (s) {
        service.authResponse = s.authResponse;
        info.resolve(s);
      }, function (f) {
        info.reject(f);
      });
      return info.promise;
    }

    function logout() {
      var info = $q.defer();
      facebookConnectPlugin.logout(function (s) {
          service.authResponse = null;
          info.resolve(s);
        },
        function (f) {
          info.resolve(f);
        });
      return info.promise;
    }

    function profile() {
      var info = $q.defer();
      facebookConnectPlugin.api('/me?fields=email,name&access_token=' + service.authResponse.accessToken, null,
        function (s) {
          info.resolve({
            authorization: service.authResponse,
            name: s.name,
            email: s.email,
            picture: "http://graph.facebook.com/" + s.id + "/picture?type=large"
          });
        },
        function (f) {
          info.reject(f);
        }
      );
      return info.promise;
    }
  }])

  .service('Status', ['envService', '$rootScope', '$http', '$interval', function (envService, $rootScope, $http, $interval) {
    var clock = null;
    var service = {};
    service.start = start;
    service.stop = stop;
    service.refresh = refresh;
    service.data = {
      time: null,
      meals: {
        b: {
          o_number: null,
          sec_left: null,
          q_today: null,
          q_question: null,
          questions: null,
          o_offer: null,
          offers: null
        },
        l: {
          o_number: null,
          sec_left: null,
          q_today: null,
          q_question: null,
          questions: null,
          o_offer: null,
          offers: null
        },
        d: {
          o_number: null,
          sec_left: null,
          q_today: null,
          q_question: null,
          questions: null,
          o_offer: null,
          offers: null
        }
      },
      priority: {
        b: [],
        l: [],
        d: []
      }
    };
    return service;

    function refresh() {
      info().then(function (result) {
        if (result.success != false)
          service.data = result;
      });
    }

    function start(msec) {
      if (clock === null) {
        clock = $interval(refresh, msec);
      }
      refresh();
    }

    function stop() {
      if (clock !== null) {
        $interval.cancel(clock);
        clock = null;
      }
    }

    function info() {
      return $http({
        url: envService.read('apiUrl') + envService.read('statusInfoPath'),
        method: 'GET',
        cache: false,
        crossDomain: true,
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function handleSuccess(result) {
      return result.data;
    }

    function handleError(error) {
      return function () {
        return {success: false, message: error};
      };
    }
  }])

  .service('Take', ['envService', '$http', function (envService, $http) {
    var service = {};
    service.question = question;
    service.cancel = cancel;
    service.confirm = confirm;
    service.reject = reject;

    return service;

    function question(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('takeQuestionPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function cancel(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('takeCancelPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function confirm(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('takeConfirmPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function reject(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('takeRejectPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function handleSuccess(result) {
      return result.data;
    }

    function handleError(error) {
      return function () {
        return {success: false, message: error};
      };
    }
  }])

  .service('Give', ['envService', '$http', function (envService, $http) {
    var service = {};
    service.offer = offer;
    service.offers = offers;
    service.cancel = cancel;
    service.confirm = confirm;
    service.reject = reject;
    return service;

    function offer(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('giveOfferPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function offers(dates) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('giveOffersPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function cancel(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('giveCancelPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function confirm(meal, status, date) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('giveConfirmPath'),
        data: {meal: meal, status: parseInt(status), date: date},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function reject(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('giveRejectPath'),
        data: {meal: meal},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function handleSuccess(result) {
      return result.data;
    }

    function handleError(error) {
      return function () {
        return {success: false, message: error};
      };
    }
  }])

  .service('User', ['envService', '$cordovaSpinnerDialog', '$ionicLoading', '$q', '$http', 'Facebook', 'USER_ROLES', function (envService, $cordovaSpinnerDialog, $ionicLoading, $q, $http, Facebook, USER_ROLES) {

    var LOCAL_TOKEN_KEY = null;
    var isAuthenticated = false;
    var role = '';
    var authToken;

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      isAuthenticated = true;
      authToken = token;

      /*TODO: Get userRole from token data*/
      role = USER_ROLES.admin;

      $http.defaults.headers.common['authorization'] = 'Bearer ' + token;
      $http.defaults.headers.common['Content-Type'] = 'application/json';
    }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      delete $http.defaults.headers.common.authorization;
    }

    var isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };

    loadUserCredentials();

    var service = {};
    service.doLogin = doLogin;
    service.doLogout = doLogout;
    service.isAuthorized = isAuthorized;
    service.isAuthenticated = function () {
      return isAuthenticated;
    };
    service.role = function () {
      return role;
    };
    service.debugLogin = function (token) {
      storeUserCredentials(token);
    }
    service.debugLogout = function () {
      destroyUserCredentials();
    }
    return service;

    function doLogin() {
      var info = $q.defer();
      if (!isAuthenticated) {
        Facebook.login().then(function (s) {
          $cordovaSpinnerDialog.show("User Checking", "The Facebook login was completed successfully! Now waiting for the application's server response...", true);
          $http({
            method: 'POST',
            cache: false,
            crossDomain: true,
            url: envService.read('apiUrl') + envService.read('userDoConnectPath'),
            headers: {'Content-Type': 'application/json'},
            data: {fbAccessToken: s.authResponse.accessToken},
            timeout: envService.read('timeout')
          }).then(function (success) {
            storeUserCredentials(success.data.jwt);
            info.resolve(success.data);
            $cordovaSpinnerDialog.hide();
          }, function (fail) {
            info.reject(fail);
            $cordovaSpinnerDialog.hide();
            $ionicLoading.hide();
            $ionicLoading.show({
              template: '<h3 style="color:red">It seems something went wrong!</h3>',
              duration: 3000
            });
          })
        }, function (f) {
          info.reject(f);
        });
      }
      else {
        $ionicLoading.show({
          template: 'Already logged in!',
          duration: 1000
        });
        info.reject({error: {message: "Already logged in!"}});
      }
      return info.promise;
    }

    function doLogout() {
      var info = $q.defer();
      Facebook.logout().then(function (s) {
        destroyUserCredentials();
        /*TODO: http call to api to destroySessionCredentials and update database 'isLoggedIn' value for current user*/
        info.resolve(s);
      }, function (f) {
        info.reject(f);
      });
      return info.promise;
    }
  }])

  /*:::::User authorization:::::*/
  .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized
        }[response.status], response);
        return $q.reject(response);
      }
    };
  })

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
