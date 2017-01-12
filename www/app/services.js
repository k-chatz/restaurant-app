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
    var tab = 'menu';
    var duration = null;

    var service = {
      view: view,
      start: start,
      stop: stop,
      refresh: refresh,
      data: {}
    };

    function view(t) {
      tab = t;
      refresh();
    }

    function info() {
      $http({
        url: envService.read('apiUrl') + envService.read('statusInfoPath'),
        method: 'GET',
        cache: false,
        crossDomain: true,
        params: {tab: tab},
        timeout: envService.read('timeout')
      }).then(function (s) {
        service.data = s.data;
      }, function (f) {
        //alert('Stupid alert: ' + JSON.stringify(f));
      });
    }

    function refresh() {
      start(duration);
    }

    function start(msec) {
      stop();
      duration = msec;
      if (clock === null) {
        clock = $interval(info, duration);
        info();
      }
    }

    function stop() {
      if (clock !== null) {
        $interval.cancel(clock);
        clock = null;
      }
    }

    return service;
  }])

  .service('Menu', ['envService', '$http', function (envService, $http) {
    var service = {};
    service.breakfast = breakfast;
    service.lunch = lunch;
    service.dinner = dinner;
    return service;

    function breakfast() {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('menuPath'),
        data: {meal: 'b'},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function lunch() {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('menuPath'),
        data: {meal: 'l'},
        timeout: envService.read('timeout')
      }).then(handleSuccess, handleError('Error'));
    }

    function dinner() {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('menuPath'),
        data: {meal: 'd'},
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

  .service('User', ['envService', '$rootScope','$cordovaSpinnerDialog', '$cordovaToast', '$q', '$http', 'Facebook', 'USER_ROLES',
    function (envService, $rootScope, $cordovaSpinnerDialog, $cordovaToast, $q, $http, Facebook, USER_ROLES) {

    var LOCAL_TOKEN_KEY = null;
    var authToken;

    var service = {
      user: {},
      online: false,
      get: get,
      doLogin: doLogin,
      doLogout: doLogout,
      isAuthorized: isAuthorized,
      isAuthenticated: function () {
        return service.online;
      },
      role: function () {
        return this.user.role;
      },
      number: function () {
        return service.user.number;
      },
      isNew: function () {
        return this.user.isNew;
      },
      debugLogin: function (token) {
        storeUserCredentials(token);
      },
      debugLogout: destroyUserCredentials,
      doDelete: doDelete,
      doInsertNumber: doInsertNumber
    };

    function get() {
      var info = $q.defer();
      $http({
        method: 'GET',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('userGetPath'),
        headers: {'Content-Type': 'application/json'},
        timeout: envService.read('timeout')
      }).then(function (s) {
        info.resolve(s.data.user);
      }, function (f) {
        info.reject(f);
      });
      return info.promise;
    }

    function doLogin() {
      var info = $q.defer();
      if (!service.online) {
        Facebook.login().then(function (s) {
          $cordovaSpinnerDialog.show(
            "Connecting..",
            "Processing the information you provided by facebook.",
            true
          );
          $http({
            method: 'POST',
            cache: false,
            crossDomain: true,
            url: envService.read('apiUrl') + envService.read('userDoConnectPath'),
            headers: {'Content-Type': 'application/json'},
            data: {fbAccessToken: s.authResponse.accessToken},
            timeout: 30000
          }).then(function (success) {
            service.user = success.data.user;
            storeUserCredentials(success.data.user.accessToken);
            info.resolve(service.user);
            $cordovaSpinnerDialog.hide();
          }, function (fail) {
            info.reject(fail);
            $cordovaSpinnerDialog.hide();
          })
        }, function (f) {
          info.reject(f);
        });
      }
      else {
        $cordovaToast.show('Already Sign-In!', 'long', 'center');
        info.resolve("Already Sign-In!");
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

    function doDelete() {
      var info = $q.defer();
      $cordovaSpinnerDialog.show(
        "Delinking..",
        "Delinking your facebook account from application and deleting all information about you from app's database.",
        true
      );
      $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('userDoDelinkPath'),
        headers: {'Content-Type': 'application/json'},
        timeout: 30000
      }).then(function (s) {
        service.user = {};
        info.resolve(s.data);
        $cordovaSpinnerDialog.hide();
      }, function (f) {
        info.reject(f);
        $cordovaSpinnerDialog.hide();
      });
      return info.promise;
    }

    function doInsertNumber(numberBase64) {
      var info = $q.defer();
      $cordovaSpinnerDialog.show(
        "Processing..",
        "Checking your provided number.",
        true
      );
      $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: envService.read('apiUrl') + envService.read('userDoInsertNumberPath'),
        headers: {'Content-Type': 'application/json'},
        data: {newNumber: numberBase64},
        timeout: envService.read('timeout')
      }).then(function (s) {
        if (s.data.user.number != null && s.data.user.number != undefined) {
          service.user.number = s.data.user.number;
          service.user.role = s.data.user.role;
        }
        info.resolve(s.data.user.number);
        $cordovaSpinnerDialog.hide();
      }, function (f) {
        info.reject(f);
        $cordovaSpinnerDialog.hide();
      });
      return info.promise;
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      service.online = true;
      authToken = token;
      $http.defaults.headers.common['authorization'] = 'Bearer ' + token;
      $http.defaults.headers.common['Content-Type'] = 'application/json';
      $rootScope.$broadcast('userIsAuthenticated', true);
    }

    function loadUserCredentials() {
      service.user = {
        "isNew": null,
        "username": null,
        "name": null,
        "number": null,
        "role": 'V',
        "picture": null,
        "gender": null,
        "fbLongAccessToken": null
      };
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
        get().then(function (user) {
          service.user = user;
        });
      }
    }

    function destroyUserCredentials() {
      $rootScope.$broadcast('userIsAuthenticated', false);
      service.user = {};
      authToken = undefined;
      service.online = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      delete $http.defaults.headers.common.authorization;
    }

    function isAuthorized(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (service.online && authorizedRoles.indexOf(service.user.role) !== -1);
    }

    loadUserCredentials();
    return service;
  }])

  /*:::::User authorization:::::*/
  .factory('Interceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      request: function (config) {
        $rootScope.$broadcast('processing', {status: true, url: config.url});
        config.requestTimestamp = new Date().getTime();
        return config;
      },

      response: function (response) {
        $rootScope.$broadcast('processing', {status: false, url: null});
        response.config.responseTimestamp = new Date().getTime();
        return response;
      },

      responseError: function (response) {
        $rootScope.$broadcast('processing', {status: false, url: null});
        $rootScope.$broadcast({
          400: AUTH_EVENTS.badRequest,
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized,
          500: AUTH_EVENTS.internalServerError
        }[response.status], response.data);
        //alert( JSON.stringify(response,null,"    ") );
        return $q.reject(response);
      }

    };
  }])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('Interceptor');
  }]);
