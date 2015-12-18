'use strict';
var angular = require('angular')
              require('angular-route');
              require('angular-animate');
              require('angular-cookies');
              require('angular-sanitize');
              require('angular-touch');
              require('angular-resource');


angular.module('myApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'pegasys.services',
    'pegasys.database'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });

//define the application module
var app = require('angular').module('myApp');

/*
when we inject a controller/factory/directive we use the format found below:
    app.factory(), app.directive(), app.controller() etc,.
*/

app.controller('MainCtrl', require('./src/main.js'));
app.controller('AboutCtrl', require('./src/about.js'));
app.controller('LoginCtrl',require('./src/login.js'));

