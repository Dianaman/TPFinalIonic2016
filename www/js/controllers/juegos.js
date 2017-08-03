angular.module('starter.controller.juegos', ['ngCordova'])

.controller('JuegoBatallaCtrl', function($scope, $state, $stateParams,$timeout,SrvFirebase, UsuarioDesafio){
  var id_desafio = $stateParams.id;
  var jugador;
  
  $scope.jugada;

  $scope.es_turno_activo = false;

  $scope.tableroRival = [];
  $scope.tablero = [];


  $scope.batalla_cols = [];
  $scope.batalla_rows = [];

  $scope.estado = {
    creador: '',
    retador:''
  };

  $scope.turno = 1;

  $scope.tiros_activo = [];
  $scope.tiros_rival = [];
  $scope.puntos_activo = {};
  $scope.puntos_rival = {};




  $timeout(function(){
      var refBatallas = SrvFirebase.RefBatallasPorId(id_desafio);
      refBatallas.once("value").then(function(snapshot){
        $scope.desafio = snapshot.val();
        console.log($scope.desafio);

        if(UsuarioDesafio.getEmail() == $scope.desafio.usuario){
          $scope.tablero = $scope.desafio.puntos_usuario;
          $scope.tableroRival = $scope.desafio.puntos_rival;

          jugador = 'creador';

          //Si aún no comenzó y le toca al creador (usuario activo)
          if(!$scope.desafio.turnos_usuario){
            $scope.es_turno_activo = true;
          } 
          else {
            $scope.turno = $scope.desafio.turnos_usuario.length + 1;

            //Si comenzó y le toca al creador (usuario activo)
            if($scope.desafio.turnos_usuario.length == $scope.desafio.turnos_rival.length){
              $scope.es_turno_activo = true;
            }

            if($scope.desafio.puntos_usuario[$scope.desafio.turnos_rival[$scope.desafio.turnos_rival.length -1]]){
              $scope.estado.retador = 'Te dió';
            } else {
              $scope.estado.retador = 'Falló';
            }

            if($scope.desafio.puntos_rival[$scope.desafio.turnos_usuario[$scope.desafio.turnos_usuario.length -1]]){
              $scope.estado.creador = 'Le diste';
            } else {
              $scope.estado.creador = 'Fallaste';
            }

          }

          $scope.tiros_activo = $scope.desafio.turnos_usuario;
          $scope.tiros_rival = $scope.desafio.turnos_rival;

          $scope.puntos_activo = $scope.desafio.puntos_usuario;
          $scope.puntos_rival = $scope.desafio.puntos_rival;
          

        } else {
          $scope.tablero = $scope.desafio.puntos_rival;
          $scope.tableroRival = $scope.desafio.puntos_usuario;

          jugador = 'retador';

          //Si le toca al retador por primera vez (usuario activo)
          if(!$scope.desafio.turnos_rival && $scope.desafio.turnos_usuario){
            $scope.es_turno_activo = true;

            if($scope.desafio.puntos_rival[$scope.desafio.turnos_usuario[$scope.desafio.turnos_usuario.length -1]]){
              $scope.estado.creador = 'Te dió';
            } else {
              $scope.estado.creador = 'Falló';
            }

            $scope.estado.retador = 'Te toca';
          } 
          else if($scope.desafio.turnos_rival){
            $scope.turno = $scope.desafio.turnos_usuario.length + 1;

            //Si le toca al retador en cualquier otro turno (usuario activo)
            if($scope.desafio.turnos_usuario.length > $scope.desafio.turnos_rival.length){
              $scope.es_turno_activo = true;
            }

            if($scope.desafio.puntos_usuario[$scope.desafio.turnos_rival[$scope.desafio.turnos_rival.length -1]]){
              $scope.estado.retador = 'Le diste';
            } else {
              $scope.estado.retador = 'Fallaste';
            }

            if($scope.desafio.puntos_rival[$scope.desafio.turnos_usuario[$scope.desafio.turnos_usuario.length -1]]){
              $scope.estado.creador = 'Te dió';
            } else {
              $scope.estado.creador = 'Falló';
            }

          }

          $scope.tiros_activo = $scope.desafio.turnos_rival;
          $scope.tiros_rival = $scope.desafio.turnos_usuario;

          $scope.puntos_activo = $scope.desafio.puntos_rival;
          $scope.puntos_rival = $scope.desafio.puntos_usuario;
          
        }
        console.log(jugador);
        console.info($scope.estado);

        console.log($scope.tiros_activo);
        console.log($scope.tiros_rival);
        console.log($scope.puntos_activo);
        console.log($scope.puntos_rival);


        console.log($scope.tableroRival);
        console.log($scope.tablero);

        if($scope.desafio.dificultad == 'facil'){ 
          $scope.batalla_cols = ['a', 'b', 'c'];
          $scope.batalla_rows = [1,2,3];
        }
        else if($scope.desafio.dificultad == 'medio') { 
          $scope.batalla_cols = ['a', 'b', 'c', 'd', 'e'];
          $scope.batalla_rows = [1,2,3,4,5]; 
        }
        else { 
          $scope.batalla_cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
          $scope.batalla_rows = [1,2,3,4,5,6,7]; 
        }

        $scope.$apply();
      });

  });  

    
     
  
  $scope.selectPosition = function(row, col){
    if(jugador === 'creador'){
      if(!$scope.desafio.turnos_usuario || $scope.desafio.turnos_usuario.indexOf(row+col) === -1){
        $scope.jugada = row+col;
      }
    } else {
      if(!$scope.desafio.turnos_usuario || $scope.desafio.turnos_usuario.indexOf(row+col) === -1){
        $scope.jugada = row+col;
      }
    }
    console.log($scope.jugada);
  }

  $scope.EnviarAtaque = function(){
    if(jugador === 'creador'){
      if(!$scope.desafio.turnos_usuario){
        $scope.desafio.turnos_usuario = [];
      }
      $scope.desafio.turnos_usuario.push($scope.jugada);
    }
    else {
      if(!$scope.desafio.turnos_rival){
        $scope.desafio.turnos_rival = [];
      }
      $scope.desafio.turnos_rival.push($scope.jugada);  
    }
    console.log($scope.desafio);

    SrvFirebase.RefBatallasPorId(id_desafio).update($scope.desafio, function(error){
      if(error){
        alert('Ocurrió un error, inténtelo nuevamente.');
      }
      else {
        $state.reload();
      }
    });
  }

  $scope.userSelected = function(col, row){
    if($scope.jugada === col+row){ return true; }
    if($scope.desafio.turnos_usuario){
      for(var turno of $scope.tiros_activo){
        if(turno === col+row){
          return true;
        }
      }
    }
    return false;
  }
})

.controller('JuegoApuestaCtrl', function($scope, $state, $stateParams, SrvFirebase, UsuarioDesafio, $timeout){
  $timeout(function(){
    $scope.$apply(function(){
      var refApuestas = SrvFirebase.RefApuestasPorId(id_desafio);
      refApuestas.on("child_added", function(snapshot){
        var desafio = snapshot.val();
        console.log(snapshot.getKey());
        desafio.id_desafio = snapshot.getKey();

        if(desafio.usuario != UsuarioDesafio.getEmail()){
          $scope.listaDeDesafios.push(desafio);
        }

      });  
    });
  });
});
