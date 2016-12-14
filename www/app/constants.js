angular.module('restaurant')
  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .constant('USER_ROLES', {
    admin: 'A',
    visitor: 'V',
    boarder: 'B'
  });
