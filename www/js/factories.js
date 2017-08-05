angular.module('starter.factories', ['ionic', 'ngCordova'])

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork, DeviceTools){
 
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();    
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();    
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){
 
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            console.log("went online");
            DeviceTools.showToast('Your device regain connection');
          });
 
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("went offline");
            DeviceTools.showToast('Your device lost connection');
          });
 
        }
        else {
 
          window.addEventListener("online", function(e) {
            console.log("went online");
          }, false);    
 
          window.addEventListener("offline", function(e) {
            console.log("went offline");
          }, false);  
        }       
    }
  }
})

.factory('MensajesDesafio', function(){
  return {
    victoria: function(juego, rival){
      return '¡Enhorabuena! Le has ganado a '+rival+' en '+juego+'.';
    },
    derrota: function(juego, rival){
      return 'Has sido derrotado por '+rival+' en '+juego+'. Más suerte la próxima vez.';
    },
    empate: function(juego, rival){
      return 'Has empatado con '+rival+' en '+juego+'. Pudo ser peor...';
    },
    tuTurno: function(juego, rival){
      return 'El oponente ' + rival + 'ya ha hecho su movimiento en '+juego;
    },
    teHanDesafiado: function(juego, rival){
      return rival+' te ha desafiado en tu juego '+juego;
    }
  }
})

.factory('DeviceTools', function($ionicPlatform, $cordovaVibration, $cordovaNativeAudio, $cordovaToast){
  return {
    initialize: function(){
      try {
        $ionicPlatform.ready(function() {
          $cordovaNativeAudio
          .preloadSimple('barco', 'audio/barco.mp3')
          .then(function (msg) {
            console.log(msg);
          }, function (error) {
            alert(error);
          });

          $cordovaNativeAudio
          .preloadSimple('agua', 'audio/agua.mp3')
          .then(function (msg) {
            console.log(msg);
          }, function (error) {
            alert(error);
          });
        });
      } catch(ex){
        console.error(ex);
      }
    },
    vibrar: function(){
      try{
        $ionicPlatform.ready(function() {
          $cordovaVibration.vibrate(1000);
        });
      } catch(ex){
        console.error(ex);
      }
    },
    sonar: function(tono){
      try{
        $ionicPlatform.ready(function() {
          $cordovaNativeAudio.play(tono);
        });
      } catch(ex){
        console.error(ex);
      }
    },
    showToast: function(mensaje){
      try{
        $ionicPlatform.ready(function(){
          if(ionic.Platform.isWebView()){
            $cordovaToast.show(mensaje, 'short', 'top');
          } else {
            alert(mensaje);
          }
        });
      } catch(ex){
        console.error(ex);
      }
    }
  }
});