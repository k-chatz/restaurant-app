angular.module('restaurant')
    .constant('AUTH_EVENTS', {
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })

    .constant('USER_ROLES', {
        visitor: 'visitor_role',
        boarder: 'boarder_role',
        admin: 'admin_role'
    })
