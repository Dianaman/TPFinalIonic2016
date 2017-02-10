angular.module('starter.controllers', [])

.controller('BaseCtrl', function($rootScope, $scope, $ionicModal){

  if($rootScope.usuarioActual.getName() == '' || $rootScope.usuarioActual.getName() == undefined){
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

.controller('LoginCtrl', function($scope, $timeout, SrvFirebase, UsuarioDesafio) {


  $scope.loginData = {};
  $scope.registerData = {};
  $scope.loginData.username = "";
  $scope.respuestaToken = {};


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

      })
      
    })
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
        

        if (window.cordova) {
          if ($scope.respuestaToken.email == "komoshi@gmail.com") {
            UsuarioDesafio.login($scope.respuestaToken.email, $scope.respuestaToken.email, true);
            $scope.closeLogin();
          } else {
            UsuarioDesafio.login($scope.respuestaToken.email, $scope.respuestaToken.email, false);
            $scope.closeLogin();
          }
        } else {
          if($scope.respuestaToken != null){
            TraerUsuario();
          }
        }
      })
    })
  };


  function TraerUsuario(){
    $timeout(function (){
      var usuario = {};

      SrvFirebase.RefUsuarios().orderByChild("email").equalTo($scope.respuestaToken.email).limitToFirst(1).on("value", function(snapshot) {
        var usuarioExistente = snapshot.val();

        console.info('usuarioExistente', usuarioExistente);

        UsuarioDesafio.login($scope.respuestaToken.email, $scope.respuestaToken.email, false); 

        if(!usuarioExistente){
          SrvFirebase.RefUsuarios().push(JSON.parse(UsuarioDesafio.getFullData()));
        }
        $scope.closeLogin();
      
      });
    }) //Fin timeout
  } //Fin Traer Usuario

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };



})



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

  var puntuacionesFirebase = SrvFirebase.RefPuntuaciones();
  puntuacionesFirebase.orderByChild("puntuacion").limitToLast(10).on('child_added', function(snapshot) {
    $timeout(function(){
      var puntuacion = snapshot.val();
      $scope.puntuaciones.unshift(puntuacion);
    })
  })
})

.controller('DesafioNuevoCtrl', function($scope, $state, $timeout, SrvFirebase) {
  $scope.nuevoDesafio = {
    usuario: '',
    nombre: '',
    tipo: '',
    dificultad: 'facil',
    cierre: '',
    descripcion: '',
    fecha_creacion: new Date().getTime(),
    estado: 'abierto',
    monto: 10
  }
  
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

})

.controller('DesafioItemCtrl', function($scope, $stateParams, UsuarioDesafio, SrvFirebase) {
  /*Start Init*/
  $scope.item = JSON.parse($stateParams.item);

  var batalla, apuesta = {};
  var fecha = new Date().getTime();

  switch($scope.item.tipo){
    case 'batalla':
        var cantidad;

        if($scope.item.dificultad == 'facil'){ cantidad = 1; }
        else if($scope.item.dificultad == 'medio') { cantidad = 4; }
        else { cantidad = 10; }

        batalla = {
          id_desafio: $scope.item.id,
          usuario: $scope.item.usuario,
          rival: UsuarioDesafio.nombre,
          puntos_usuario: [],
          puntos_rival: [],
          cantidad: cantidad,
          turnos_usuario: [],
          turnos_rival: [],
          fecha_creacion: fecha,
          estado: 'pendiente',
          ganador: null
        };

        break;
    case 'apuesta':
        apuesta = {
          id_desafio: $scope.item.id,
          usuario: $scope.item.usuario,
          rival: UsuarioDesafio.nombre,
          resultado: null,
          eleccion_usuario: null,
          eleccion_rival: null,
          fecha_creacion: fecha,
          estado: 'pendiente',
          ganador: null
        }

        break;
  }


  

  $scope.desafiar = function(){
    switch($scope.item.tipo){

      case 'batalla':

        SrvFirebase.RefBatallas().push().set(batalla, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
          }
        });

        break;

      case 'apuesta':

        SrvFirebase.RefApuestas().push().set(apuesta, function(error){
          if(error){
            alert('Ocurrió un error. Inténtalo nuevamente.');
          }
          else {
            alert('Desafío exitoso, aguarde la respuesta de su oponente.');
          }
        });

        break;
    }
  }
})

.controller('BatallaCtrl', function($scope){
  /*Finish Init*/ 
  $scope.puntos_usuario = ['b3', 'a1'];
  $scope.btnEnviarDisabled = true;
  $scope.batalla = {
    cantidad: 3
  }

  $scope.userSelected =  function(fila, col){
    console.log(fila+col);
    return $scope.puntos_usuario.indexOf(fila+col) > -1;
  }

  $scope.selectPosition = function(fila, col){
    //si la coordenada no estaba seleccionada
    if($scope.puntos_usuario.indexOf(fila+col) == -1)
    {

      if($scope.batalla.cantidad > $scope.puntos_usuario.length){
        $scope.puntos_usuario.push(fila+col);
      }

      //si igualo la cantidad de coordenadas a enviar
      if($scope.batalla.cantidad == $scope.puntos_usuario.length){
        $scope.btnEnviarDisabled = false;
      }
    }

    //si la coordenada ya estaba entre las seleccionadas
    else {
      $scope.puntos_usuario.splice($scope.puntos_usuario.indexOf(fila+col),1);
        $scope.btnEnviarDisabled = true;
    }
    console.log($scope.puntos_usuario);


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

;