angular.module('restaurant')
  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    internalServerError: 'internal-server-error'
  })

  .constant('USER_ROLES', {
    admin: 'A',
    visitor: 'V',
    boarder: 'B'
  });
