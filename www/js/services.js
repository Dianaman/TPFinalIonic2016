angular.module('starter.services', [])

.factory('UsuarioDesafio',[function(){
  var email = "";
  var key = "";
  var creditos = 0;
  var soyAdmin = false;

  return {
    login:function(mail,fbkey, credits, admin){
      email = mail;
      key = fbkey;
      creditos = credits;
      soyAdmin = admin;
    },getEmail:function(){
      return email;
    },getKey:function(){
      return key;
    },getCred:function(){
      return creditos;
    },isAdmin:function(){
      return soyAdmin;
    },getFullData:function(){
      var jsonUsuario = {};
      jsonUsuario.email = email;
      jsonUsuario.key = key;
      jsonUsuario.creditos = creditos;
      jsonUsuario.soyAdmin = soyAdmin;
      return JSON.stringify(jsonUsuario);
    }
  };
}])

.service('SrvFirebase', ['$http',function($http){

  this.RefUsuarios = RefUsuarios;
  this.RefDesafios = RefDesafios;
  this.RefDesafioPorId = RefDesafioPorId;
  this.RefBatallas = RefBatallas;
  this.RefBatallasPorId = RefBatallasPorId;
  this.RefApuestas = RefApuestas;
  this.RefApuestasPorId = RefApuestasPorId;
  this.RefPuntuaciones = RefPuntuaciones;
  this.EnviarNotificacion = EnviarNotificacion;

  function ObtenerRef(coleccion){
    return firebase.database().ref(coleccion);

  }

  function RefUsuarios(){
    return ObtenerRef('usuarios/');
  }
  
  function RefDesafios(){
    return ObtenerRef('desafios/');
  }

  function RefDesafioPorId(id){
    return ObtenerRef('desafios/'+id);
  }

  function RefBatallas(){
    return ObtenerRef('batallas/');
  }

  function RefBatallasPorId(id){
    return ObtenerRef('batallas/'+id);
  }

  function RefApuestas(){
    return ObtenerRef('apuestas/');
  }

  function RefApuestasPorId(id){
    return ObtenerRef('apuestas/'+id+'/');
  }

  function RefPuntuaciones(){
    return ObtenerRef('puntuaciones/');
  }

  function EnviarNotificacion(titulo, mensaje, usuario){
    var http = new XMLHttpRequest();
    var url =  'https://fcm.googleapis.com/fcm/send';
    
    var params = JSON.stringify({
        "to":"/topics/all", //Topic or single device
        "notification":{
            "title":titulo,  //Any value
            "body":mensaje,  //Any value
            "sound":"default", //If you want notification sound
            "click_action":"FCM_PLUGIN_ACTIVITY",  //Must be present for Android
            "icon":"fcm_push_icon"  //White icon Android resource
        },
        "priority":"high" //If not set, notification won't be delivered on completely closed iOS app
      });

      http.open("POST", url, true);
      http.setRequestHeader("Content-type", "application/json");
      http.setRequestHeader('Authorization', 'key=AIzaSyDO9dc0jlIOmA7Fg1NXL3YnaEB4F9CVoTE');

      http.onreadystatechange = function() {
          if(http.readyState == 4 && http.status == 200) {
              console.log(http.responseText);
          }
      }
      http.send(params);
    }
}]);