// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.controller.login', 'starter.controller.desafios', 'starter.controller.juegos',
            'starter.services', 'starter.directives', 'starter.factories', 'ngCordovaOauth'])

.run(function($ionicPlatform,$rootScope,UsuarioDesafio, DeviceTools,ConnectivityMonitor) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.usuarioActual = UsuarioDesafio;

    DeviceTools.initialize();
    ConnectivityMonitor.startWatching();
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'BaseCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.about', {
    url: '/about',
    views: {
      'tab-about': {
        templateUrl: 'templates/tab-autor.html',
        controller: 'AboutCtrl'
      }
    }
  })

  .state('tab.tienda', {
    url: '/tienda',
    cache:false,
    views: {
      'tab-tienda': {
        templateUrl: 'templates/tab-tienda.html',
        controller: 'TiendaCtrl'
      }
    }
  })

  .state('tab.ranking', {
    url: '/ranking',
    views: {
      'tab-ranking': {
        templateUrl: 'templates/tab-ranking.html',
        controller: 'RankingCtrl'
      }
    }
  })

  .state('desafios', {
    url: '/desafio',
    abstract: true,
    cache:false,
    templateUrl: 'templates/desafios/desafios.html',
    controller: 'BaseCtrl'
  })

  .state('desafios.todos', {
    url: '/todos',
    views: {
      'desafios-todos': {
        templateUrl: 'templates/desafios/todos.html',
        controller: 'DesafiosCtrl'
      }
    }
  })

  .state('desafios.item', {
    url: '/desafios-item/:item',
    cache:false,
    views: {
      'desafios-item': {
        templateUrl: 'templates/desafios/item.html',
        controller: 'DesafioItemCtrl'
        /*,views: {
          'desafios-batalla': {
            templateUrl: 'templates/desafios/batalla-naval.html',
            controller: 'BatallaCtrl'
          }
        }*/
      }
    }
  })

  .state('desafios.nuevo', {
    url: '/nuevo/:tipo',
    views: {
      'desafios-nuevo': {
        templateUrl: 'templates/desafios/nuevo.html',
        controller: 'DesafioNuevoCtrl'
      }
    }
  })

  .state('desafios.misdesafios', {
    url: '/misdesafios',
    cache:false,
    views: {
      'desafios-misdesafios': {
        templateUrl: 'templates/desafios/misdesafios.html',
        controller: 'MisDesafiosCtrl'
      }
    }
  })

  .state('juego', {
    url: '/juego',
    abstract: true,
    controller: 'BaseCtrl',
    templateUrl: 'templates/juegos/juegos.html'
  })

  .state('juego.batalla', {
    url: '/batalla/:id',
    cache: false,
    views:{
      'juegos-batalla':{
        templateUrl: 'templates/desafios/batallanaval.html',
        controller: 'JuegoBatallaCtrl'
      }
    }
  })

  .state('tab.item', {
    url: '/item/:item',
    cache: false,
    views:{
      'tab-item':{
        templateUrl: 'templates/desafios/item.html',
        controller: 'DesafioItemCtrl'
      }
    }
  })

  .state('tab.opciones', {
    url: '/opciones',
    cache: false,
    views:{
      'tab-opciones':{
        templateUrl: 'templates/desafios/tipo.html',
        controller: 'DesafioTiposCtrl'
      }
    }
  })


;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
