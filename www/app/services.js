angular.module('restaurant.services', [])

  .service('AuthService', function ($q, $http, USER_ROLES) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var username = '';
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
      username = token.split('.')[0];
      isAuthenticated = true;
      authToken = token;

      role = USER_ROLES.visitor;

      if (username == 'admin') {
        role = USER_ROLES.admin;
      }
      else {
        role = USER_ROLES.boarder;
      }

      // Set the token as header for your requests!
      $http.defaults.headers.common['X-Auth-Token'] = token;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      username = '';
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var login = function (name, pw) {


      return $q(function (resolve, reject) {


        if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
          // Make a request and receive your auth token from your server
          storeUserCredentials(name + '.yourServerToken');
          resolve('Login success.');
        } else {
          reject('Login Failed.');
        }
      });


    };

    var logout = function () {
      console.info("AuthService function: logout");
      destroyUserCredentials();
    };

    var isAuthorized = function (authorizedRoles) {
      //console.log(authorizedRoles);
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };


    loadUserCredentials();

    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function () {
        return isAuthenticated;
      },
      username: function () {
        return username;
      },
      role: function () {
        return role;
      }
    };
  })

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

  /*****My old services*****/

  .factory('UserService', ['$http', function ($http) {
    var service = {};

    service.GetAll = GetAll;
    service.GetById = GetById;
    service.GetByUsername = GetByUsername;
    service.Create = Create;
    service.Update = Update;
    service.Delete = Delete;

    return service;

    function GetAll() {
      return $http.get('/api/v1/users').then(handleSuccess, handleError('Error getting all users'));
    }

    function GetById(id) {
      return $http.get('/api/v1/users' + id).then(handleSuccess, handleError('Error getting user by id'));
    }

    function GetByUsername(username) {
      return $http.get('/api/v1/users' + username).then(handleSuccess, handleError('Error getting user by username'));
    }

    function Create(user) {
      return $http.post('/api/v1/users', user).then(handleSuccess, handleError('Error creating user'));
    }

    function Update(user) {
      return $http.put('/api/v1/users' + user.id, user).then(handleSuccess, handleError('Error updating user'));
    }

    function Delete(id) {
      return $http.delete('/api/v1/users' + id).then(handleSuccess, handleError('Error deleting user'));
    }

    // private functions
    function handleSuccess(res) {
      return res.data;
    }

    function handleError(error) {
      return function () {
        return {success: false, message: error};
      };
    }
  }])

  .factory('Clock', function ($interval) {
    var clock = null;
    var service = {
      start: function (fn) {
        if (clock === null) {
          clock = $interval(fn, 1000);
        }
      },
      stop: function () {
        if (clock !== null) {
          $interval.cancel(clock);
          clock = null;
        }
      }
    };

    return service;
  })

  .service('Status', ['$rootScope', '$http', '$interval', function ($rootScope, $http, $interval) {
    var clock = null;
    var service = {};

    //var host = 'http://192.168.1.2/restaurant-api'
    //var host = 'http://83.212.118.209/restaurant-api'
    var host = '../../Restaurant-API';

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
          q_tomorrow: null,
          q_username: null,
          questions: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        l: {
          o_number: null,
          sec_left: null,
          q_today: null,
          q_tomorrow: null,
          q_username: null,
          questions: null,
          o_today: null,
          o_tomorrow: null,
          offers: null
        },
        d: {
          o_number: null,
          sec_left: null,
          q_today: null,
          q_tomorrow: null,
          q_username: null,
          questions: null,
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
    return service;

    function refresh() {
      info().then(function (result) {
        if(result.success!= false)
          service.data = result;
      });
    }

    function start(msec) {
      if (clock === null) {
        clock = $interval(refresh, msec);
      }
    }

    function stop() {
      if (clock !== null) {
        $interval.cancel(clock);
        clock = null;
      }
    }

    function info() {
      return $http({
        url: host + '/v1/status/info',
        method: 'GET',
        data: {},
        //headers: {'Content-Type': 'text/plain'},
        cache: false,
        crossDomain: true
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

  .service('Take', ['$http', function ($http) {
    var service = {};

    //var host = 'http://192.168.1.2/restaurant-api'
    //var host = 'http://83.212.118.209/restaurant-api'
    var host = '../../Restaurant-API';

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
        url: host + '/v1/take/question',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function cancel(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/take/cancel',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function confirm(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/take/confirm',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function reject(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/take/reject',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
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

  .service('Give', ['$http', function ($http) {
    var service = {};

    //var host = 'http://192.168.1.2/restaurant-api'
    //var host = 'http://83.212.118.209/api'
    var host = '../../Restaurant-API';

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
        url: host + '/v1/give/offer',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function offers(dates) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/give/offers',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function cancel(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/give/cancel',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function confirm(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/give/confirm',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
      }).then(handleSuccess, handleError('Error'));
    }

    function reject(meal) {
      return $http({
        method: 'POST',
        cache: false,
        crossDomain: true,
        url: host + '/v1/give/reject',
        headers: {'Content-Type': 'application/json'},
        data: {meal: meal}
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

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
