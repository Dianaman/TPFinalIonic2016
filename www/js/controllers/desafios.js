angular.module('starter.controller.desafios', ['ngCordova'])

.controller('DesafiosCtrl', function($scope, SrvFirebase, $state, UsuarioDesafio, $timeout) {
  $scope.listaDeDesafios = [];

  $timeout(function(){
      var RefDesafios = SrvFirebase.RefDesafios();
      RefDesafios.orderByChild("estado").equalTo("abierto").on("child_added", function(snapshot){
        var desafio = snapshot.val();
        console.log(snapshot.getKey());
        desafio.id_desafio = snapshot.getKey();

        if(desafio.usuario != UsuarioDesafio.getEmail()){
          $scope.listaDeDesafios.push(desafio);
          $scope.$apply();
        }
      });
  });  

  $scope.verDesafio = function(desafio){
    var des = JSON.stringify(desafio);
    $state.go('tab.item', {item: des});
  }
})

.controller('DesafioItemCtrl', function($scope, $stateParams, UsuarioDesafio, SrvFirebase, $state, DeviceTools, MensajesDesafio) {

  $scope.item = JSON.parse($stateParams.item);
  
  console.log($scope.item);

  $scope.btnEnviarDisabled = true;

  $scope.puntos = {};
  $scope.datos = {
    monto_punto: 10,
    monto: $scope.item.monto,
    puntos_seleccionados: []
  };

  $scope.datos.batalla_cols = [];
  $scope.datos.batalla_rows = [];


  $scope.usuarioActual = UsuarioDesafio.getEmail();
  var fecha = new Date().getTime();

  console.log($scope.item);
  switch($scope.item.tipo){
    case 'batalla':
      var cantidad;

      if($scope.item.dificultad == 'facil'){ 
        $scope.datos.batalla_cols = ['a', 'b', 'c'];
        $scope.datos.batalla_rows = [1,2,3];
      }
      else if($scope.item.dificultad == 'medio') { 
        $scope.datos.batalla_cols = ['a', 'b', 'c', 'd', 'e'];
        $scope.datos.batalla_rows = [1,2,3,4,5]; 
      }
      else { 
        $scope.datos.batalla_cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        $scope.datos.batalla_rows = [1,2,3,4,5,6,7]; 
      }

      $scope.desafio = {
        id_desafio: $scope.item.id_desafio,
        dificultad: $scope.item.dificultad,
        monto: $scope.item.monto,
        nombre: $scope.item.nombre,
        usuario: $scope.item.usuario,
        rival: $scope.item.rival,
        puntos_usuario: $scope.item.puntos_usuario,
        puntos_rival: [],
        cantidad: $scope.item.cantidad,
        turnos_usuario: [],
        turnos_rival: [],
        fecha_creacion: $scope.item.fecha_creacion,
        estado: 'jugando',
        ganador: null
      };
      break;
  case 'apuesta':

      $scope.desafio = {
        id_desafio: $scope.item.id_desafio,
        monto: $scope.item.monto,
        nombre: $scope.item.nombre,
        usuario: $scope.item.usuario,
        descripcion: $scope.item.descripcion,
        rival: $scope.item.rival,
        resultado: null,
        eleccion_usuario: $scope.item.eleccion_usuario,
        eleccion_rival: $scope.item.eleccion_rival ? $scope.item.eleccion_rival: '',
        fecha_creacion: $scope.item.fecha_creacion,
        fecha_resultado: new Date($scope.item.fecha_resultado),
        estado: 'jugando',
        ganador: null
      }
      break;
  }

  $scope.userSelected =  function(fila, col){
    return $scope.datos.puntos_seleccionados.indexOf(fila+col) > -1;
  }

  $scope.wasSelected = function(fila, col){
    return $scope.desafio.puntos_usuario[fila+col] ? true : false;
  }

  $scope.selectPosition = function(fila, col){
    //si la coordenada no estaba seleccionada
    if($scope.datos.puntos_seleccionados.indexOf(fila+col) == -1)
    {
      if($scope.desafio.cantidad != $scope.datos.puntos_seleccionados.length){

        if($scope.datos.monto >= $scope.datos.monto_punto){
          $scope.datos.monto -= $scope.datos.monto_punto;
          $scope.puntos[fila+col] = $scope.datos.monto_punto;

          if($scope.desafio.cantidad > $scope.datos.puntos_seleccionados.length){
          
            $scope.datos.puntos_seleccionados.push(fila+col);
          }

          //si igualo la cantidad de coordenadas a enviar
          if($scope.desafio.cantidad == $scope.datos.puntos_seleccionados.length){
            if($scope.datos.monto == 0){
              $scope.btnEnviarDisabled = false;
            }
            else{
              DeviceTools.showToast('La cantidad de créditos en juego debe ser igual a '+$scope.item.monto);
            }
          }
        }
        else {

          DeviceTools.showToast('No puede apostar esa cantidad, seleccione un monto inferior.');
        }
      } else {
        DeviceTools.showToast('La cantidad de créditos en juego debe ser igual a '+$scope.item.monto);
      }
    }

    //si la coordenada ya estaba entre las seleccionadas
    else {
      $scope.datos.puntos_seleccionados.splice($scope.datos.puntos_seleccionados.indexOf(fila+col),1);
        $scope.btnEnviarDisabled = true;
        $scope.datos.monto += $scope.puntos[fila+col];
        delete $scope.puntos[fila+col];
    }
    console.log($scope.datos.puntos_seleccionados);
    console.log($scope.puntos);
  }



  $scope.desafiar = function(){
    console.log('desafiar');
    console.log($scope.desafio);

    if($scope.item.tipo == 'batalla'){
      $scope.desafio.puntos_rival = $scope.puntos;
    }

    SrvFirebase.RefDesafioPorId($scope.desafio.id_desafio).update($scope.desafio, function(error){
      if(error){
        DeviceTools.showToast('Ocurrió un error. Inténtalo nuevamente.');
      }
      else {
        DeviceTools.showToast('Desafío exitoso, aguarde la respuesta de su oponente.');
        SrvFirebase.EnviarNotificacion('TE HAN DESAFIADO', MensajesDesafio.teHanDesafiado($scope.desafio.nombre, UsuarioDesafio.getEmail), $scope.desafio.usuario);
        $state.go('desafios.todos');
      }
    });

    SrvFirebase.RefUsuarioPorId(UsuarioDesafio.getKey()).on('child_added', function(snapshot){
      var usuario = snapshot.val();
      usuario.creditos -= $scope.desafio.monto;

      SrvFirebase.RefUsuarioPorId(UsuarioDesafio.getKey()).update(usuario, function(error){
        if(error){
          console.error(error);
          DeviceTools.showToast('Ocurrió un error. Inténtelo nuevamente.');
        }
      })
    })
  }

  $scope.actualizar = function(){
    $scope.desafio.estado = 'finalizado';

    var diferenciaUsuario = Math.abs($scope.desafio.eleccion_usuario - $scope.desafio.resultado);
    var diferenciaRival = Math.abs($scope.desafio.eleccion_rival + $scope.desafio.resultado);
    var rival = activoEsUsuario ? $scope.desafio.rival : $scope.desafio.usuario;
    var mensajeActivo = '';
    var mensajeRival = '';

    if(diferenciaUsuario < diferenciaRival){
      if($scope.desafio.usuario == UsuarioDesafio.getEmail()){
        mensajeActivo = 'victoria';
        mensajeRival = 'derrota';
        $scope.desafio.ganador = UsuarioDesafio.getEmail();
      } else {
        mensajeActivo = 'derrota';
        mensajeRival = 'victoria';
        $scope.desafio.ganador = rival;
      }
    } else if(diferenciaUsuario > diferenciaRival){
      if($scope.desafio.usuario == UsuarioDesafio.getEmail()){
        mensajeActivo = 'derrota';
        mensajeRival = 'victoria';
        $scope.desafio.ganador = UsuarioDesafio.getEmail();
      } else {
        mensajeActivo = 'victoria';
        mensajeRival = 'derrota';
        $scope.desafio.ganador = rival;
      }
    } else {
      mensajeActivo = 'empate';
      mensajeRival = 'empate';
      $scope.desafio.ganador = '';
    }
    console.info('actualizar', $scope.desafio);

    SrvFirebase.RefDesafioPorId($scope.desafio.id_desafio).update($scope.desafio, function(error){
      if(error){
        DeviceTools.showToast('Ocurrió un error. Inténtelo nuevamente');
      }
    });

    var actualizarCreditos = [];
    SrvFirebase.RefUsuarios().once('value', function(snap){
      snap.forEach(function(data){
        var user = data.val();
        var id = data.key();
        if(user.email == UsuarioDesafio.getEmail()){
          if(mensajeActivo == 'victoria'){
            user.creditos = user.creditos + ($scope.desafio.monto * 2);
          } else if(mensajeActivo == 'empate'){
            user.creditos = user.creditos + $scope.desafio.monto;
          }
          actualizarCreditos.push(user);
        } else if (user.email == rival){
          if(mensajeRival == 'victoria'){
            user.creditos = user.creditos + ($scope.desafio.monto * 2);
          } else if(mensajeRival == 'empate'){
            user.creditos = user.creditos + $scope.desafio.monto;
          }
          actualizarCreditos.push(user);
        }
      });

      console.log(actualizarCreditos);
      SrvFirebase.RefUsuarios().update(actualizarCreditos, function(error){
        if(error){
          console.error(error);
        }
      })
    })

  }
})

.controller('DesafioTiposCtrl', function($scope, $state){
  $scope.ElegirTipo = function(tipo){
    $state.go('desafios.nuevo', {tipo:tipo});
  }
})

.controller('DesafioNuevoCtrl', function($scope, $state, $stateParams, $timeout, SrvFirebase, UsuarioDesafio, DeviceTools) {
  
  $scope.opciones = {};
  $scope.desafio = {};

  var fecha = new Date().getTime();

  $scope.puntos = {};
  $scope.puntos_seleccionados = [];
  $scope.datos = {
    monto_punto: 10,
    monto: $scope.opciones.monto
  };

  $scope.datos.batalla_cols = [];
  $scope.datos.batalla_rows = [];


  if(window.cordova){
    $scope.opciones.esmobile = true;
  }
  else {
    $scope.opciones.esmobile = false;
  }

  $scope.opciones.dificultad = 'facil';
  $scope.opciones.tipo = $stateParams.tipo;
  
  var actualizarGrilla = function(){

    if($scope.opciones.dificultad == 'facil'){ 
      $scope.opciones.cantidad = 1; 
      $scope.datos.batalla_cols = ['a', 'b', 'c'];
      $scope.datos.batalla_rows = [1,2,3];
    }
    else if($scope.opciones.dificultad == 'medio') { 
      $scope.opciones.cantidad = 3;
      $scope.datos.batalla_cols = ['a', 'b', 'c', 'd', 'e'];
      $scope.datos.batalla_rows = [1,2,3,4,5]; 
    }
    else { 
      $scope.opciones.cantidad = 7;
      $scope.datos.batalla_cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      $scope.datos.batalla_rows = [1,2,3,4,5,6,7]; 
    }
  }

  switch($scope.opciones.tipo){
    case 'batalla':
      var cantidad;

      actualizarGrilla();

      $scope.desafio = {
        usuario: UsuarioDesafio.getEmail(),
        rival: '',
        puntos_usuario: [],
        puntos_rival: [],
        dificultad: 'facil',
        cantidad: cantidad,
        turnos_usuario: [],
        turnos_rival: [],
        ganador: null,
        estado:'abierto',
        fecha_creacion: new Date().getTime(),
        tipo: 'batalla'
      };
      break;
    case 'apuesta':
      $scope.desafio = {
        usuario: UsuarioDesafio.getEmail(),
        rival: '',
        descripcion: '',
        resultado: null,
        fecha_resultado: new Date(),
        eleccion_usuario: null,
        eleccion_rival: '',
        ganador: null,
        estado:'abierto',
        fecha_creacion: new Date().getTime(),
        tipo: 'apuesta'
      }
      break;
  }    



  $scope.actualizarMonto = function(){
     $scope.datos.monto = $scope.opciones.monto;
  }

  $scope.actualizarGrilla = function(){
    actualizarGrilla();
    $scope.puntos = {};
    $scope.datos.monto = $scope.opciones.monto;
  }


  $scope.userSelected =  function(fila, col){
    return $scope.puntos_seleccionados.indexOf(fila+col) > -1;
  }

  $scope.selectPosition = function(fila, col){

    //si la coordenada no estaba seleccionada
    if($scope.puntos_seleccionados.indexOf(fila+col) == -1)
    {
      if($scope.opciones.cantidad != $scope.puntos_seleccionados.length)
      {
        if($scope.datos.monto >= $scope.datos.monto_punto){
          $scope.datos.monto -= $scope.datos.monto_punto;
          $scope.puntos[fila+col] = $scope.datos.monto_punto;

          if($scope.opciones.cantidad > $scope.puntos_seleccionados.length){
            $scope.puntos_seleccionados.push(fila+col);
          }

          //si igualo la cantidad de coordenadas a enviar
          if($scope.opciones.cantidad == $scope.puntos_seleccionados.length){
            if($scope.datos.monto == 0){ $scope.btnEnviarDisabled = false;  }
            else { DeviceTools.showToast('La cantidad de créditos en juego debe ser igual a '+$scope.opciones.monto); }
          }
        } else { DeviceTools.showToast('La cantidad de créditos en juego debe ser igual a '+$scope.opciones.monto); }
      } else { DeviceTools.showToast('No puede apostar esa cantidad, seleccione un monto inferior.'); }

    }

    //si la coordenada ya estaba entre las seleccionadas
    else {
      $scope.puntos_seleccionados.splice($scope.puntos_seleccionados.indexOf(fila+col),1);
        $scope.btnEnviarDisabled = true;
        $scope.datos.monto += $scope.puntos[fila+col];
        delete $scope.puntos[fila+col];
    }
    console.log($scope.puntos_seleccionados);
    console.log($scope.puntos);

  }

  $scope.crearDesafio = function(){


    $scope.desafio.nombre = $scope.opciones.nombre;
    $scope.desafio.monto = $scope.opciones.monto;

    if($scope.opciones.tipo == 'batalla'){
      $scope.desafio.puntos_usuario = $scope.puntos;
      $scope.desafio.dificultad = $scope.opciones.dificultad;
      $scope.desafio.cantidad = $scope.opciones.cantidad;
    } else {
      $scope.desafio.fecha_resultado = $scope.desafio.fecha_resultado.getTime();
    }
    console.log($scope.desafio)

    SrvFirebase.RefDesafios().push().set($scope.desafio, function(error){
      if(error){
        DeviceTools.showToast('Ocurrió un error. Inténtalo nuevamente.');
      }
      else {
        DeviceTools.showToast('Desafío exitoso, aguarde la respuesta de su oponente.');

        $state.go('desafios.todos');
      }
    });

    SrvFirebase.RefUsuarioPorId(UsuarioDesafio.getKey()).on('child_added', function(snapshot){
      var usuario = snapshot.val();
      usuario.creditos -= $scope.desafio.monto;

      SrvFirebase.RefDesafioPorId(UsuarioDesafio.getKey()).update(usuario, function(error){
        if(error){
          console.error(error);
          DeviceTools.showToast('Ocurrió un error. Inténtelo nuevamente.');
        }
      })
    });
  }



  $scope.ElegirFecha = function(){
 
    try{
      $ionicPlatform.ready(function() {
        var options = {
          date: new Date(),
          mode: 'datetime', // or 'time'
          minDate: new Date() - 10000,
          allowFutureDates: false,
          doneButtonLabel: 'DONE',
          doneButtonColor: '#F2F3F4',
          cancelButtonLabel: 'CANCEL',
          cancelButtonColor: '#000000'
      };

        $cordovaDatePicker.show(options).then(function(date){
            alert(date);
        });
      });
    }
    catch(e){
      console.error(e);
    }
  }
})

.controller('MisDesafiosCtrl', function($scope, $state, $timeout, SrvFirebase, UsuarioDesafio) {
  $scope.listaDeDesafios = [];

  $timeout(function(){

    var RefDesafios = SrvFirebase.RefDesafios();
    RefDesafios.orderByChild("usuario").equalTo(UsuarioDesafio.getEmail()).once("value", function(snapshot){
      var desafios = snapshot.val();
      snapshot.forEach(function(child){
        var desafio = child.val();
        desafio.id_desafio = child.getKey();

        if(desafio.tipo == 'batalla'){
          var yo = desafio.turnos_usuario == undefined ? 0 : desafio.turnos_usuario.length;
          var otro = desafio.turnos_rival == undefined ? 0 : desafio.turnos_rival.length;

          if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){

            if(desafio.estado == 'jugando'){
              if(yo == otro){ desafio.turno = 'ahora'; }
              else { desafio.turno = 'espera'; }
            }

            $scope.listaDeDesafios.push(desafio);
          }
        } else {

          if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){
            $scope.listaDeDesafios.push(desafio);
          }
        }
      });

      $scope.$apply();  
    });


    RefDesafios.orderByChild("rival").equalTo(UsuarioDesafio.getEmail()).once("value", function(snapshot){
      var desafios = snapshot.val();
      snapshot.forEach(function(child){
        var desafio = child.val();
        desafio.id_desafio = child.getKey();

        if(desafio.tipo == 'batalla'){
          var yo = desafio.turnos_usuario == undefined ? 0 : desafio.turnos_usuario.length;
          var otro = desafio.turnos_rival == undefined ? 0 : desafio.turnos_rival.length;

          if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){

            if(desafio.estado == 'jugando'){
              if(yo == otro){ desafio.turno = 'ahora'; }
              else { desafio.turno = 'espera'; }
            }

            $scope.listaDeDesafios.push(desafio);
          }
        } else {

          if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){
            $scope.listaDeDesafios.push(desafio);
          }
        }
      });

      $scope.$apply();  
    });
  });  



  $scope.verDesafio = function(desa){
    var des = desa.id_desafio;
    console.log(des);
    var strDesafio = JSON.stringify(desa);

    if(desa.tipo == 'batalla'){
      if(desa.estado == 'jugando'){
        $state.go('juego.batalla', {id: des});
      }
      else {
        $state.go('tab.item', {item: strDesafio});
      }
    }
    else {
      $state.go('tab.item', {item:strDesafio});
    }
  }

});
