angular.module('starter.controllers', ['ngCordova'])






.controller('DashCtrl', function($scope, $state) {

  $scope.MisDesafios = function(){
    $state.go('desafios.misdesafios');
  }

  $scope.VerDesafios = function(){
    $state.go('desafios.todos');
  }

  $scope.CrearDesafio = function(){
    $state.go('desafios.nuevo');
  }

  $scope.IrATienda = function(){
    $state.go('tab.tienda');
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


.controller('RankingCtrl', function($scope, $ionicPlatform, $timeout, SrvFirebase){
  $scope.puntuaciones = [];

  var puntuacionesFirebase = SrvFirebase.RefPuntuaciones();
  puntuacionesFirebase.orderByChild("puntuacion").limitToLast(10).on('child_added', function(snapshot) {
    $timeout(function(){
      var puntuacion = snapshot.val();
      $scope.puntuaciones.unshift(puntuacion);
    })
  })
})

.controller('BatallaCtrl', function($scope, SrvFirebase, $stateParams, $timeout){
  /*Finish Init*/ 

  $scope.puntos_usuario = [];
  $scope.btnEnviarDisabled = true;
  $scope.batalla = {};

  $scope.puntos = {};
  $scope.datos = {
    monto_punto: 10,
    monto: $scope.batalla.monto
  };

  console.log($stateParams);

  var id = $stateParams.batalla;

  $timeout(function(){
    SrvFirebase.RefBatallas().orderByChild("id").equalTo(id).limitToFirst(1).on("value", function(snapshot){
      if(snapshot){
        $scope.batalla = snapshot.val();
console.log(snapshot);

        
        /*if($scope.batalla){

          for (var name in $scope.batalla.puntos_rival) {
            console.log(name + "=" + $scope.batalla.puntos_rival[name]);
          }
        }*/
        $scope.$apply();
      }
      else {
        alert('Ocurrió un error. Inténtalo nuevamente.');
      }
    });
  })

  $scope.userSelected =  function(fila, col){
    return $scope.puntos_usuario.indexOf(fila+col) > -1;
  }

  $scope.selectPosition = function(fila, col){
    if($scope.puntos_seleccionados.indexOf(fila+col) == -1){
      //si toca barco
      if($scope.puntos_rival[fila+col] != undefined){
        $scope.tocados.push[fila+col] = $scope.puntos_rival[fila+col];
      }
      
      $scope.puntos_seleccionados.push(fila+col);
    }





    if($scope.puntos_usuario.indexOf(fila+col) == -1)
    {

      if($scope.datos.monto >= $scope.datos.monto_punto){
        $scope.datos.monto -= $scope.datos.monto_punto;
        $scope.puntos[fila+col] = $scope.datos.monto_punto;

        if($scope.batalla.cantidad > $scope.puntos_usuario.length){
        
          $scope.puntos_usuario.push(fila+col);
        }


        //si igualo la cantidad de coordenadas a enviar
        if($scope.batalla.cantidad == $scope.puntos_usuario.length){
          if($scope.datos.monto == 0){
            $scope.btnEnviarDisabled = false;
          }
          else{
            alert('La cantidad de créditos en juego debe ser igual a '+$scope.batalla.monto);
          }
        }
      }
      else {

        alert('No puede apostar esa cantidad, seleccione un monto inferior.');
      }

    }

    //si la coordenada ya estaba entre las seleccionadas
    else {
      $scope.puntos_usuario.splice($scope.puntos_usuario.indexOf(fila+col),1);
        $scope.btnEnviarDisabled = true;
        $scope.datos.monto += $scope.puntos[fila+col];
        delete $scope.puntos[fila+col];
    }
    console.log($scope.puntos_usuario);

    $scope.EnviarPosiciones = function(){
      SrvFirebase.RefBatallas().push().set(batalla, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
          }
        });
    }

/*  if(angular.element(event.target).hasClass('batalla-punto-seleccionado')){
      angular.element(event.target).removeClass('batalla-punto-seleccionado');
      $scope.desafio.puntos.splice($scope.desafio.puntos.indexOf(event.target.id),1);
    }
    else {
      angular.element(event.target).addClass('batalla-punto-seleccionado');
      $scope.desafio.puntos.push(event.target.id);
    }

    if($scope.desafio.cantidad == $scope.desafio.puntos.length){
      referencia.set($scope.desafio).then(function(){
        //if($scope.desafio.usuario == $rootScope.usuario){
          alert('¡Comienza a jugar!');
          console.log($scope.desafio);
        //}else{
        //  alert('Esperemos a tu rival');
        //}
      }).catch(function(){
        alert('Ocurrió un error, intentalo más tarde.');
      });
    }*/
  } 
})

.controller('TiendaCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaBarcodeScanner, UsuarioDesafio){

  /*$scope.escanear = function(){
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          // Success! Barcode data is here
        }, function(error) {
          // An error occurred
        });


      // NOTE: encoding not functioning yet
      $cordovaBarcodeScanner
        .encode(BarcodeScanner.Encode.TEXT_TYPE, "http://www.nytimes.com")
        .then(function(success) {
          // Success!
        }, function(error) {
          // An error occurred
        });
    });
  }*/

  $scope.creditos = {};


  try{


    $scope.cargarCredito = function(){
      var codigo = $scope.creditos.codigo;
      console.log(codigo);

      firebase.database().ref('codigos/').orderByChild("codigo").equalTo(codigo).limitToFirst(1).on("child_added", function(snapshot){
        var codigoExistente = snapshot.val();

        if(codigoExistente)
        {
          console.log(codigoExistente.disponible == true);
          if(codigoExistente.disponible === true)
          {
            codigoExistente['usuario'] = UsuarioDesafio.getEmail();
            codigoExistente['fecha'] = new Date().getTime();
            codigoExistente['disponible'] = false;


            firebase.database().ref('codigos/'+snapshot.key).update(codigoExistente, function(error){
              if(error){
                alert('Ocurrió un error, inténtelo nuevamente.');
              }
              else {
                var creditoActual = UsuarioDesafio.getCred() + codigoExistente.monto;
                var creditojson = {creditos: creditoActual}

                firebase.database().ref('usuarios/'+UsuarioDesafio.getKey()).update(creditojson, function(error){
                  if(error)
                  {
                    alert('Ocurrió un error, inténtelo nuevamente.')
                  }
                  else {
                    alert('Tu crédito ha sido cargado.');
                    $rootScope.usuarioActual.creditos = creditoActual;
                  }
                });
              }
            }); //firebase update codigo
          }
          else {
            alert('El código ya ha sido utilizado. Contáctate con algún administrador.');
          }
        }
        else {
          alert('El código es inexistente');
        }
      });
    };


    $scope.escanear = function(){
      $ionicPlatform.ready(function(){
        $cordovaBarcodeScanner.scan().then(function(imageData) {
              alert(imageData.text);
              console.log("Barcode Format -> " + imageData.format);
              console.log("Cancelled -> " + imageData.cancelled);
          }, function(error) {
              console.log("An error happened -> " + error);
          });
      })
    }
  }catch(e){
    console.error(e);
  }
})


;