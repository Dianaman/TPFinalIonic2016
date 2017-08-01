angular.module('starter.controllers', ['ngCordova'])

.controller('BaseCtrl', function($rootScope, $scope, $ionicModal){

  if($rootScope.usuarioActual == undefined || $rootScope.usuarioActual.getEmail() == '' || $rootScope.usuarioActual.getEmail() == undefined){
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      backdropClickToClose: false
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }
})

.controller('LoginCtrl', function($scope, $timeout, SrvFirebase, UsuarioDesafio, $state, $q, $cordovaOauth ) {


  $scope.loginData = {};
  $scope.registerData = {};
  $scope.loginData.username = "komoshi@gmail.com";
  $scope.loginData.password = "123456";
  $scope.respuestaToken = {};
  $scope.VerLogin = true;


  $scope.habilitado = true; //spinner login
  $scope.habilitadoRegister = true; //spinner register

  $scope.GoRegistrar = function() {
    $scope.VerLogin = false;
  };

  $scope.GoLogin = function() {
    $scope.VerLogin = true;
  };

  $scope.Registrarse = function(){

    $scope.habilitadoRegister = false;

    firebase.auth().createUserWithEmailAndPassword($scope.registerData.username, $scope.registerData.password).catch(function (error){
      console.info("error", error);

      if (error.code == "auth/invalid-email") {
        alert("El mail ingresado es invalido");
      };

      if (error.code == "auth/user-not-found") {
        alert("No hay email que se corresponda con el ingresado. Puede que el usuario haya borrado esa cuenta.")
      };

      if (error.code == "auth/weak-password") {
        alert("La contraseña debe tener al menos 6 caracteres");
      };

      if (error.code == "auth/email-already-in-use") {
        alert("El mail ya esta registrado con un proveedor diferente");
      };

    }).then(function (respuesta){

      $timeout(function (){

        $scope.VerLogin = true;
        $scope.habilitadoRegister = true;
        console.info("respuesta", respuesta);

        if (firebase.auth().currentUser != null) {

          firebase.auth().currentUser.sendEmailVerification() //Apenas se registra, envio mail para verificar casilla.
            .then(function (response){
              $scope.habilitadoRegister = true;
              alert("Se envio mail de verificacion a tu casilla. Ingresa en el link que alli se indica para completar el registro");

            }) 

        };

      }, 0)
      
    });

  };

  $scope.GithubLogin = function(){
    try {
      alert(window.location.href); 

      $cordovaOauth.github('1da1f3fb9ac7fa61ac6e', '9f35fa521fec2c656fd07853641062747ffc34d6', [])
        .then(function(result) {
          if(result.access_token){
            $scope.respuestaToken = result.access_token;
            $scope.closeLogin();
          }
      }, function(error) {
          console.error(error);
      });
    } catch(error){
      console.error(error);
    };
  };


  $scope.OlvidePassword = function(){
    console.log("olvideeee");

    if($scope.loginData.username != ""){
        firebase.auth().sendPasswordResetEmail($scope.loginData.username).then(function (respuesta){
        console.info("respuestaOlvide", respuesta);

        alert("Se envio mail de reestablecimiento de Password a su casilla");

      }).catch(function (error){
        console.info("errorOlvide", error);

        if (error.code == "auth/invalid-email") {
          alert("El mail ingresado es invalido");
        };

        if (error.code == "auth/user-not-found") {
          alert("No hay email que se corresponda con el ingresado. Puede que el usuario haya borrado esa cuenta.")
        };
      })
    } else {
      alert("Ingrese un mail valido en el campo Email");
    }
  };

  // Perform the login action when the user submits the login form
  $scope.LogIn = function() {

    $scope.habilitado = false;

    firebase.auth().signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).catch(function (error){

      $scope.habilitado = true;
      switch(error.code){
        case "auth/user-not-found":
          alert("No estas registrado");
          break;
        case "auth/account-exists-with-different-credential":
          alert('Ya estas registrado con un proveedor diferente para ese email.');
          break;
        case "auth/wrong-password":
          alert("La contraseña es incorrecta");
          break;
        default:
          alert(error.code);
      }

    }).then(function (respuesta){
      $timeout(function(){
        console.info("respuesta", respuesta);
        if(respuesta){
          $scope.habilitado = true;
          if(!respuesta.emailVerified){
            alert('Debe verificar su cuenta');
            return;
          }
          var user = respuesta;
          console.log(firebase.auth().currentUser);
        }
        
        $scope.respuestaToken = respuesta;
        console.log(respuesta);
        console.log(window.cordova);

        if (window.cordova) {
          /*if ($scope.respuestaToken.email == "komoshi@gmail.com") {
            UsuarioDesafio.login($scope.respuestaToken.email, $scope.respuestaToken.email, true);
            $scope.closeLogin();
          } else {
            UsuarioDesafio.login($scope.respuestaToken.email, $scope.respuestaToken.email, false);
            $scope.closeLogin();
          }*/

          TraerUsuario();
        } else {
          if($scope.respuestaToken != null){
            TraerUsuario();
          }
        }
      })
    })
  };


  function TraerUsuario(){
    $q.all($timeout(function (){
      var usuario = {};

      console.log(UsuarioDesafio);
      SrvFirebase.RefUsuarios().orderByChild("email").equalTo($scope.loginData.username).limitToFirst(1).on("child_added", function(snapshot) {
        var usuarioExistente = snapshot.val();

        console.info('usuarioExistente', usuarioExistente);

        UsuarioDesafio.login(usuarioExistente.email, snapshot.getKey(), usuarioExistente.creditos, usuarioExistente.soyAdmin); 

      
      });
    })).then(function(){
         if(UsuarioDesafio.getEmail() == ''){
          console.log('gfdgdgd');


        SrvFirebase.RefUsuarios().push().set({'email': $scope.loginData.username, 'creditos':1000, 'soyAdmin':false},
          function(error){
            if(error){
              alert('Ocurrió un error, inténtelo nuevamente');
            }
            else {
              SrvFirebase.RefUsuarios().orderByChild("email").equalTo($scope.loginData.username).limitToFirst(1).on("child_added", function(snapshot) {
              var nuevoUsuario = snapshot.val();

               console.info('nuevo usuario', nuevoUsuario);

              UsuarioDesafio.login(nuevoUsuario.email, snapshot.getKey(), nuevoUsuario.creditos, nuevoUsuario.soyAdmin); 

              $scope.closeLogin();
              });
            }
          });
      }else {
        
        $scope.closeLogin();
      }/*, $timeout(function(){
      if(UsuarioDesafio.getEmail() == ''){
        SrvFirebase.RefUsuarios().push().set({'email': $scope.loginData.username, 'creditos':1000, 'soyAdmin':false},
          function(error){
            if(error){
              alert('Ocurrió un error, inténtelo nuevamente');
            }
            else {
              SrvFirebase.RefUsuarios().orderByChild("email").equalTo($scope.loginData.username).limitToFirst(1).on("child_added", function(snapshot) {
              var nuevoUsuario = snapshot.val();

              console.info('nuevo usuario', nuevoUsuario);

              UsuarioDesafio.login(nuevoUsuario.email, snapshot.getKey(), nuevoUsuario.creditos, nuevoUsuario.soyAdmin); 

              });
            }
          });
      }

    }) //Fin timeout*/
    });
  } //Fin Traer Usuario

  $scope.closeLogin = function() {
    $state.go('tab.dash');
    $scope.modal.hide();

  };



})



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

.controller('DesafiosJuegoCtrl', function($scope, $stateParams,$timeout,SrvFirebase, UsuarioDesafio){
  var tipo = $stateParams.tipo;
  var id_desafio = $stateParams.id;
  var jugador;
  
  $scope.jugada;

  $scope.tableroRival = [];
  $scope.tablero = [];


  $scope.batalla_cols = [];
  $scope.batalla_rows = [];

  switch(tipo){
    case 'batalla':



      $timeout(function(){
          var refBatallas = SrvFirebase.RefBatallasPorId(id_desafio);
          refBatallas.once("value").then(function(snapshot){
            $scope.desafio = snapshot.val();
            console.log($scope.desafio);

            if(UsuarioDesafio.getEmail() == $scope.desafio.usuario){
              $scope.tablero = $scope.desafio.puntos_usuario;
              $scope.tableroRival = $scope.desafio.puntos_rival;
              jugador = 'creador';
            } else {
              $scope.tablero = $scope.desafio.puntos_rival;
              $scope.tableroRival = $scope.desafio.puntos_usuario;
              jugador = 'retador';
            }

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

      break;
    case 'apuesta':

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
      break;
  }

  $scope.selectPosition = function(row, col){
    if(jugador === 'creador'){
      if(!$scope.desafio.turnos_usuario || $scope.desafio.turnos_usuario.indexOf(row+col) !== -1){
        $scope.jugada = row+col;
      }
    } else {
      if(!$scope.desafio.turnos_usuario || $scope.desafio.turnos_usuario.indexOf(row+col) !== -1){
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
  }

  $scope.userSelected = function(col, row){
    if($scope.jugada === col+row){ return true; }
    if($scope.desafio.turnos_usuario){
      for(var turno of $scope.desafio.turnos_usuario){
        if(turno === col+row){
          return true;
        }
      }
    }
    return false;
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
        $state.go('juego', {tipo: 'batalla', id: des});
      }
      else {
        $state.go('desafios.batalla', {batalla: des});
      }
    }
    else {
      $state.go('desafios.apuesta', des);
    }
  }

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