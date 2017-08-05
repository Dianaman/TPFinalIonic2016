angular.module('starter.controller.juegos', ['ngCordova'])

.controller('JuegoBatallaCtrl', function($scope, $state, $stateParams,$timeout,SrvFirebase, UsuarioDesafio, $ionicPopup, MensajesDesafio, DeviceTools){
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

  var RIVAL_SENDER_ID;


  $timeout(function(){
      var RefDesafios = SrvFirebase.RefDesafioPorId(id_desafio);
      RefDesafios.once("value").then(function(snapshot){
        $scope.desafio = snapshot.val();
        console.log($scope.desafio);

        var refUsuarios = SrvFirebase.RefUsuarios();
        refUsuarios.orderByChild('email').equalTo($scope.desafio.rival).limitToFirst(1).once("value").then(function(snap){
          RIVAL_SENDER_ID = snap.val().sender_id;
        });

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

            //si el retador aun no hizo su primer tiro
            if(!$scope.desafio.turnos_rival){
              $scope.estado.retador = 'Esperando jugada';
            } else {
              //Si comenzó y le toca al creador (usuario activo)
              if($scope.desafio.turnos_usuario.length == $scope.desafio.turnos_rival.length){
                $scope.es_turno_activo = true;
              }

              if($scope.desafio.puntos_usuario[$scope.desafio.turnos_rival[$scope.desafio.turnos_rival.length -1]]){
                $scope.estado.retador = 'Te dió';
              } else {
                $scope.estado.retador = 'Falló';
              }              
            }
            if($scope.desafio.puntos_rival[$scope.desafio.turnos_usuario[$scope.desafio.turnos_usuario.length -1]]){
              $scope.estado.creador = 'Le diste';
            } else {
              $scope.estado.creador = 'Fallaste';
            }


          }

          if($scope.es_turno_activo){
            if($scope.estado.retador == 'Te dió'){  DeviceTools.sonar('barco'); 
            } else { DeviceTools.sonar('agua'); }
          } else {
            if($scope.estado.creador == 'Le diste'){  DeviceTools.sonar('barco'); 
            } else { DeviceTools.sonar('agua'); }
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

          if($scope.es_turno_activo){
            if($scope.estado.creador == 'Te dió'){  DeviceTools.sonar('barco'); 
            } else { DeviceTools.sonar('agua'); }
          } else {
            if($scope.estado.retador == 'Le diste'){  DeviceTools.sonar('barco'); 
            } else { DeviceTools.sonar('agua'); }
          }

          $scope.tiros_activo = $scope.desafio.turnos_rival;
          $scope.tiros_rival = $scope.desafio.turnos_usuario;

          $scope.puntos_activo = $scope.desafio.puntos_rival;
          $scope.puntos_rival = $scope.desafio.puntos_usuario;
          
        }

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

        console.log($scope.es_turno_activo);

        chequearJuegoFinalizado();

        $scope.$apply();
      });

  });  

  $scope.esAgua = function(row, col, player){
    if(player == 'rival'){
      if(Object.keys($scope.puntos_activo).length !== 0 && $scope.tiros_rival){
        return ($scope.tiros_rival.indexOf(row+col) !== -1 && $scope.puntos_activo[row+col]);
      }
    } else {
      if(Object.keys($scope.puntos_rival).length !== 0 && $scope.tiros_activo){
        return ($scope.tiros_activo.indexOf(row+col) !== -1 && $scope.puntos_rival[row+col]);
      }
    }

    return false;
  }  
  $scope.esBarco = function(row, col, player){
    if(player == 'rival'){
      if(Object.keys($scope.puntos_activo).length !== 0 && $scope.tiros_rival){
        return ($scope.tiros_rival.indexOf(row+col) !== -1 && !$scope.puntos_activo[row+col]);
      }
    } else {
      if(Object.keys($scope.puntos_rival).length !== 0 && $scope.tiros_activo){
        return ($scope.tiros_activo.indexOf(row+col) !== -1 && !$scope.puntos_rival[row+col]);
      }
    }
  }
     
  
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

    SrvFirebase.RefDesafioPorId(id_desafio).update($scope.desafio, function(error){
      if(error){
        alert('Ocurrió un error, inténtelo nuevamente.');
      }
      else {
        SrvFirebase.EnviarNotificacion('TE TOCA', 
            MensajesDesafio['tuTurno']('batalla', UsuarioDesafio.getEmail()),
            RIVAL_SENDER_ID
        );
        $state.reload();
      }
    });
  }

  $scope.userSelected = function(col, row){
    if($scope.jugada === col+row){ return true; }
    if($scope.desafio.tiros_activo){
      for(var turno of $scope.tiros_activo){
        if(turno === col+row){
          return true;
        }
      }
    }
    return false;
  }

  chequearJuegoFinalizado = function(){
    var cantidadDePuntos = Object.keys($scope.desafio.puntos_usuario).length;
    var aciertosUsuario = 0, aciertosRival = 0;

    console.log('chequearFinalizado')

    if($scope.desafio.estado == 'jugando' && 
      $scope.desafio.turnos_usuario && $scope.desafio.turnos_rival &&
      $scope.desafio.turnos_usuario.length == $scope.desafio.turnos_rival.length)
    {
      
      for(var turno of $scope.desafio.turnos_usuario){
        if($scope.desafio.puntos_rival[turno]){
            aciertosUsuario ++;
        }
      }

      for(var turno of $scope.desafio.turnos_rival){
        if($scope.desafio.puntos_usuario[turno]){
            aciertosRival ++;
        }
      }

      console.log(aciertosUsuario);
      console.log(aciertosRival);
      console.log(cantidadDePuntos);


      if(aciertosUsuario == cantidadDePuntos || aciertosRival == cantidadDePuntos){

        console.log('finalizado');
        $scope.desafio.estado = 'finalizado';
        var activoEsUsuario = UsuarioDesafio.getEmail() == $scope.desafio.usuario;

        var rival = activoEsUsuario ? $scope.desafio.rival : $scope.desafio.usuario;
        var mensajeActivo = '';
        var mensajeRival = '';

        if(aciertosUsuario > aciertosRival){
          if(activoEsUsuario){
            mensajeActivo = 'victoria';
            mensajeRival = 'derrota';
            $scope.desafio.ganador = UsuarioDesafio.getEmail();
          }
          else {
            mensajeActivo = 'derrota';
            mensajeRival = 'victoria';
            $scope.desafio.ganador = rival;
          }
        } else if (aciertosUsuario < aciertosRival){
          if(activoEsUsuario){
            mensajeActivo = 'derrota';
            mensajeRival = 'victoria';
            $scope.desafio.ganador = UsuarioDesafio.getEmail();
          }
          else {
            mensajeActivo = 'victoria';
            mensajeRival = 'derrota';
            $scope.desafio.ganador = rival;
          }
        } else {
            mensajeActivo = 'empate';
            mensajeRival = 'empate';
            $scope.desafio.ganador = '';
        }

        SrvFirebase.RefDesafioPorId(id_desafio).update($scope.desafio, function(error){
          if(error){
            console.error(error);
            DeviceTools.showToast('Ocurrió un error, inténtelo nuevamente');
          }
        })

        var actualizarCreditos = [];
        SrvFirebase.RefUsuarios().once('value', function(snap){
          snap.forEach(function(data){
            var user = data.val();
            var id = data.getKey();
            console.log(user);
            console.log(id);

            if(user.email == UsuarioDesafio.getEmail()){
              if(mensajeActivo == 'victoria'){
                user.creditos = user.creditos + ($scope.desafio.monto * 2);
              } else if(mensajeActivo == 'empate'){
                user.creditos = user.creditos + $scope.desafio.monto;
              }
              actualizarCreditos.push({key:id, user:user});
            } else if (user.email == rival){
              if(mensajeRival == 'victoria'){
                user.creditos = user.creditos + ($scope.desafio.monto * 2);
              } else if(mensajeRival == 'empate'){
                user.creditos = user.creditos + $scope.desafio.monto;
              }
              actualizarCreditos.push({key:id, user:user});
            }
          });

          console.log(actualizarCreditos);
          for(var user of actualizarCreditos){
            SrvFirebase.RefUsuarioPorId(user.key).update(user.user, function(error){
              if(error){
                console.error(error);
              }
            })
          }
        })


        var alertPopup = $ionicPopup.alert({
          title: mensajeActivo.toUpperCase(),
          template: MensajesDesafio[mensajeActivo]('batalla', rival)
        });

        SrvFirebase.EnviarNotificacion(mensajeRival.toUpperCase(), 
            MensajesDesafio[mensajeRival]('batalla', UsuarioDesafio.getEmail()),
            RIVAL_SENDER_ID
        );

      }
    }

    
  }
})

.controller('JuegoApuestaCtrl', function($scope, $state, $stateParams, SrvFirebase, UsuarioDesafio, $timeout){
  $timeout(function(){
    $scope.$apply(function(){
      var RefDesafios = SrvFirebase.RefDesafioPorId(id_desafio);
      RefDesafios.on("child_added", function(snapshot){
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
