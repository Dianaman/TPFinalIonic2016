angular.module('starter.controller.login', ['ngCordova'])

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
        }
        
        $scope.respuestaToken = respuesta;
        console.log(respuesta);

        if ($scope.respuestaToken != null) {
          TraerUsuario();
        }
      })
    })
  };


  function TraerUsuario(){
    var usuario = {};

    SrvFirebase.RefUsuarios().orderByChild("email").equalTo($scope.loginData.username).once("value", function(snapshot) {
      if(snapshot.val() !== null){
        console.log('existente');

        snapshot.forEach(function(child){

          var usuarioExistente = child.val();
          UsuarioDesafio.login(usuarioExistente.email, child.key, usuarioExistente.creditos, usuarioExistente.soyAdmin); 
          console.log(UsuarioDesafio.getFullData());
        })

        $scope.closeLogin();
      }
      else {
        console.log('nuevo');

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
      }
    
    });

  } //Fin Traer Usuario

  $scope.closeLogin = function() {
    $state.go('tab.dash');
    $scope.modal.hide();

  };



});
