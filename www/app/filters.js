angular.module('restaurant.filters', [])
.filter('secondsToDateTime', [function () {
    return function (seconds) {
        seconds = seconds <= 0 ? seconds + 86400 : seconds;
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor((seconds % 86400) / 3600);
        var mins = Math.floor(((seconds % 86400) % 3600) / 60);
        var secs = ((seconds % 86400) % 3600) % 60;
        return (days > 0 ? days + 'd ' : '') + ('00' + hours).slice(-2) + ':' + ('00' + mins).slice(-2) + ':' + ('00' + secs).slice(-2);
    };
}]);
