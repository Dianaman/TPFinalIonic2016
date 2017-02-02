angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state) {
  $scope.VerDesafios = function(){
    $state.go('desafios.todos');
  }

  $scope.CrearDesafio = function(){
    $state.go('desafios.nuevo');
  }

  $scope.IrATienda = function(){
    $state.go('store');
  }

  $scope.VerRanking = function(){
    $state.go('tab.ranking');
  }

  $scope.About = function(){
    $state.go('tab.about');
  }


})

.controller('AboutCtrl', function($scope, $window) {
  $scope.sendMail = function(emailId, subject, message){
    $window.open("mailto:" + emailId + "?subject=" + subject+"&body="+message,"_self");
  }
})

.controller('DesafiosCtrl', function($scope) {
  $scope.listaDeDesafios = [];

  $scope.listaDeDesafios = [{
    id: 00001,
    nombre: 'desafio1',
    autor: 'pepito',
    estado: 'activo'
  },{
    id: 00002,
    nombre: 'desafio1',
    autor: 'pepito',
    estado: 'cerrado'
  },{
    id: 00003,
    nombre: 'Desafienme',
    autor: 'cielito',
    estado: 'abierto'
  }]
})


.controller('RankingCtrl', function($scope, $ionicPlatform, $timeout, SrvFirebase){
  $scope.puntuaciones = [];

  var puntuacionesFirebase = SrvFirebase.RefDesafios();
  puntuacionesFirebase.on('child_added', function(snapshot) {
    $timeout(function(){
      var puntuacion = snapshot.val();
      $scope.puntuaciones.push(puntuacion);
    })
  })
})

.controller('DesafioNuevoCtrl', function($scope, $state, $timeout, SrvFirebase) {
  $scope.nuevoDesafio = {};
  
  $scope.crearDesafio = function(){
    var referencia = SrvFirebase.RefDesafios();
    var referenciaFirebase = referencia.push();

    referenciaFirebase.set($scope.nuevoDesafio, function(error){
      var mensaje = '';

      if(error){
        mensaje = 'Ocurrió un problema al crear el desafío. Intentelo más tarde.';
        console.error('Error desafío: ', error);
      }
      else{
        mensaje = '¡¡Desafío creado exitosamente!!';
        console.info('Desafío: ', $scope.nuevoDesafio);
        try{
          SrvFirebase.EnviarNotificacion();
        }catch(error){
          alert(error);
        }
      }


      $timeout(function(){
        $scope.cargando = false;
        alert(mensaje);

        $state.go('desafios.todos');
      }, 1000);
    });
  }

});
