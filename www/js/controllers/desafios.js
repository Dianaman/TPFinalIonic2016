angular.module('starter.controller.desafios', ['ngCordova'])

.controller('DesafiosCtrl', function($scope, SrvFirebase, $state, UsuarioDesafio, $timeout) {
  $scope.listaDeDesafios = [];

  $timeout(function(){
      var refBatallas = SrvFirebase.RefBatallas();
      refBatallas.orderByChild("estado").equalTo("abierto").on("child_added", function(snapshot){
        var desafio = snapshot.val();
        console.log(snapshot.getKey());
        desafio.id_desafio = snapshot.getKey();
        desafio.tipo = 'batalla';

        if(desafio.usuario != UsuarioDesafio.getEmail()){
          $scope.listaDeDesafios.push(desafio);
          $scope.$apply();
        }

      });

      var refApuestas = SrvFirebase.RefApuestas();
      refApuestas.orderByChild("estado").equalTo("abierto").on("child_added", function(snapshot){
        var desafio = snapshot.val();
        console.log(snapshot.getKey());
        desafio.id_desafio = snapshot.getKey();
        desafio.tipo = 'apuesta';

        if(desafio.usuario != UsuarioDesafio.getEmail()){
          $scope.listaDeDesafios.push(desafio);
          $scope.$apply();
        }

      });  
  });  



  $scope.verDesafio = function(desafio){
    var des = JSON.stringify(desafio);

    $state.go('desafios.item', {item: des});
  }

})


.controller('DesafioItemCtrl', function($scope, $stateParams, UsuarioDesafio, SrvFirebase, $state) {
  /*Start Init*/
  $scope.item = JSON.parse($stateParams.item);
  
  console.log($scope.item);
  //batalla
  //$scope.puntos_usuario = [];
  $scope.btnEnviarDisabled = true;

  $scope.puntos = {};
  $scope.datos = {
    monto_punto: 10,
    monto: $scope.item.monto,
    puntos_seleccionados: []
  };

  $scope.datos.batalla_cols = [];
  $scope.datos.batalla_rows = [];


  //apuesta

  console.log(UsuarioDesafio.getEmail());
  $scope.batalla, $scope.apuesta = {};
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

        $scope.batalla = {
          id_desafio: $scope.item.id_desafio,
          dificultad: $scope.item.dificultad,
          monto: $scope.item.monto,
          nombre: $scope.item.nombre,
          usuario: $scope.item.usuario,
          rival: UsuarioDesafio.getEmail(),
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

        $scope.apuesta = {
          id_desafio: $scope.item.id_desafio,
          dificultad: $scope.item.dificultad,
          monto: $scope.item.monto,
          nombre: $scope.item.nombre,
          usuario: $scope.item.usuario,
          rival: UsuarioDesafio.getEmail(),
          resultado: null,
          eleccion_usuario: $scope.item.eleccion_usuario,
          eleccion_rival: '',
          fecha_creacion: $scope.item.fecha_creacion,
          estado: 'jugando',
          ganador: null
        }

        console.log($scope.apuesta);
        break;
  }


  $scope.userSelected =  function(fila, col){
    return $scope.datos.puntos_seleccionados.indexOf(fila+col) > -1;
  }

  $scope.selectPosition = function(fila, col){


    //si la coordenada no estaba seleccionada
    if($scope.datos.puntos_seleccionados.indexOf(fila+col) == -1)
    {
      if($scope.batalla.cantidad != $scope.datos.puntos_seleccionados.length){

        if($scope.datos.monto >= $scope.datos.monto_punto){
          $scope.datos.monto -= $scope.datos.monto_punto;
          $scope.puntos[fila+col] = $scope.datos.monto_punto;

          if($scope.batalla.cantidad > $scope.datos.puntos_seleccionados.length){
          
            $scope.datos.puntos_seleccionados.push(fila+col);
          }


          //si igualo la cantidad de coordenadas a enviar
          if($scope.batalla.cantidad == $scope.datos.puntos_seleccionados.length){
            if($scope.datos.monto == 0){
              $scope.btnEnviarDisabled = false;
            }
            else{
              alert('La cantidad de créditos en juego debe ser igual a '+$scope.item.monto);
            }
          }
        }
        else {

          alert('No puede apostar esa cantidad, seleccione un monto inferior.');
        }
      } else {
        alert('La cantidad de créditos en juego debe ser igual a '+$scope.item.monto);
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
    console.log($scope.batalla);
    console.log($scope.apuesta);
    console.log()


    switch($scope.item.tipo){

      case 'batalla':

        $scope.batalla.puntos_rival = $scope.puntos;
            
        SrvFirebase.RefBatallasPorId($scope.batalla.id_desafio).update($scope.batalla, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
            $state.go('desafios.todos');
          }
        });

        break;

      case 'apuesta':

        SrvFirebase.RefApuestasPorId($scope.apuesta.id_desafio).update($scope.apuesta, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
            try{
              SrvFirebase.EnviarNotificacion();
            }catch(error){
              alert(error);
            }
            $state.go('desafios.todos');
          }
        });

        break;
    }
  }


})


.controller('DesafioNuevoCtrl', function($scope, $state, $timeout, SrvFirebase, UsuarioDesafio) {
  
  $scope.opciones = {};
  var fecha = new Date().getTime();


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

  if(window.cordova){
    $scope.opciones.esmobile = true;
  }
  else {
    $scope.opciones.esmobile = false;
  }


  $scope.puntos = {};
  $scope.puntos_seleccionados = [];
  $scope.datos = {
    monto_punto: 10,
    monto: $scope.opciones.monto
  };

  $scope.datos.batalla_cols = ['a', 'b', 'c'];
  $scope.datos.batalla_rows = [1,2,3];

  $scope.apuesta, $scope.batalla = {};


  $scope.actualizarTipo = function(){

    switch($scope.opciones.tipo){
      case 'batalla':
          var cantidad;

          actualizarGrilla();

          $scope.batalla = {
            usuario: UsuarioDesafio.getEmail(),
            rival: '',
            puntos_usuario: [],
            puntos_rival: [],
            dificultad: '',
            cantidad: cantidad,
            turnos_usuario: [],
            turnos_rival: [],
            ganador: null,
            estado:'abierto',
            fecha_creacion: new Date().getTime()
          };

          break;
      case 'apuesta':

          $scope.apuesta = {
            usuario: UsuarioDesafio.getEmail(),
            rival: '',
            descripcion: '',
            resultado: null,
            fecha_resultado: null,
            eleccion_usuario: null,
            eleccion_rival: '',
            ganador: null,
            estado:'abierto',
            fecha_creacion: new Date().getTime()
          }

          console.log($scope.apuesta);
          break;
    }    
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
    if(es_turno_activo){

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
            if($scope.datos.monto == 0){
              $scope.btnEnviarDisabled = false;
            }
            else{
              alert('La cantidad de créditos en juego debe ser igual a '+$scope.opciones.monto);
            }
          }
        }
        else {
          alert('La cantidad de créditos en juego debe ser igual a '+$scope.opciones.monto);
        }
      }
      else {

        alert('No puede apostar esa cantidad, seleccione un monto inferior.');
      }

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
  }

  $scope.crearDesafio = function(){

    switch($scope.opciones.tipo){

      case 'batalla':
        console.log($scope.batalla);
        $scope.batalla.nombre = $scope.opciones.nombre;
        $scope.batalla.puntos_usuario = $scope.puntos;
        $scope.batalla.dificultad = $scope.opciones.dificultad;
        $scope.batalla.cantidad = $scope.opciones.cantidad;
        $scope.batalla.monto = $scope.opciones.monto;
        console.log($scope.batalla);

        SrvFirebase.RefBatallas().push().set($scope.batalla, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
            $state.go('desafios.todos', {}, {location:'replace'});
          }
        });

        break;

      case 'apuesta':

        $scope.apuesta.nombre = $scope.opciones.nombre;
        $scope.batalla.monto = $scope.opciones.monto;

        SrvFirebase.RefApuestas().push().set($scope.apuesta, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
            try{
              SrvFirebase.EnviarNotificacion();
            }catch(error){
              alert(error);
            }
            $state.go('desafios.todos');
          }
        });

        break;
    }
  }

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
})

.controller('MisDesafiosCtrl', function($scope, $state, $timeout, SrvFirebase, UsuarioDesafio) {
  $scope.listaDeDesafios = [];

  $timeout(function(){

    var refBatallas = SrvFirebase.RefBatallas();
    refBatallas.orderByChild("usuario").equalTo(UsuarioDesafio.getEmail()).on("child_added", function(snapshot){
      var desafio = snapshot.val();
      console.log(snapshot.getKey());
      desafio.id_desafio = snapshot.getKey();

      desafio.tipo = 'batalla';

      var yo = desafio.turnos_usuario == undefined ? 0 : desafio.turnos_usuario.length;
      var otro = desafio.turnos_rival == undefined ? 0 : desafio.turnos_rival.length;

      if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){

        if(desafio.estado == 'jugando'){
          if(yo == otro){ desafio.turno = 'ahora'; }
          else { desafio.turno = 'espera'; }
        }

        $scope.listaDeDesafios.push(desafio);
        $scope.$apply();
      }
    });

    refBatallas.orderByChild("rival").equalTo(UsuarioDesafio.getEmail()).on("child_added", function(snapshot){
      var desafio = snapshot.val();
      console.log(snapshot.val());
      desafio.id_desafio = snapshot.getKey();

      desafio.tipo = 'batalla';

      var otro = desafio.turnos_usuario == undefined ? 0 : desafio.turnos_usuario.length;
      var yo = desafio.turnos_rival == undefined ? 0 : desafio.turnos_rival.length;

      if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){

        if(desafio.estado == 'jugando'){
          if(otro > yo){ desafio.turno = 'ahora'; }
          else { desafio.turno = 'espera'; }
        }

        $scope.listaDeDesafios.push(desafio);
        $scope.$apply();
      }
    });

    var refApuestas = SrvFirebase.RefApuestas();
    refApuestas.orderByChild("usuario").equalTo(UsuarioDesafio.getEmail()).on("child_added", function(snapshot){
      var desafio = snapshot.val();
      console.log(snapshot.val());
      desafio.id_desafio = snapshot.getKey();

      desafio.tipo = 'apuesta';

      if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){
        $scope.listaDeDesafios.push(desafio);
        $scope.$apply();
      }
    });

    var refApuestas = SrvFirebase.RefApuestas();
    refApuestas.orderByChild("rival").equalTo(UsuarioDesafio.getEmail()).on("child_added", function(snapshot){
      var desafio = snapshot.val();
      console.log(snapshot.val());
      desafio.id_desafio = snapshot.getKey();

      desafio.tipo = 'apuesta';

      if(desafio.estado == 'jugando' || desafio.estado == 'abierto'){
        $scope.listaDeDesafios.push(desafio);
        $scope.$apply();
      }
    });    
  });  



  $scope.verDesafio = function(desa){
    var des = desa.id_desafio;
    console.log(des);

    if(desa.tipo == 'batalla'){
      if(desa.estado == 'jugando'){
        $state.go('juego.batalla', {id: des});
      }
      else {
        $state.go('desafios.batalla', {batalla: des});
      }
    }
    else {
      $state.go('desafios.apuesta', des);
    }
  }

});
