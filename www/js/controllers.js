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

.controller('DesafioBatallaCtrl', function($scope) {
  $scope.desafio = {
    cantidad: 1,
    puntos: []
  }

  console.log(this);

  $scope.selectPoint = function(event){
    if(angular.element(event.target).hasClass('batalla-punto-seleccionado')){
      angular.element(event.target).removeClass('batalla-punto-seleccionado');
      $scope.desafio.puntos.splice($scope.desafio.puntos.indexOf(event.target.id),1);
    }
    else {
      angular.element(event.target).addClass('batalla-punto-seleccionado');
      $scope.desafio.puntos.push(event.target.id);
    }

    if($scope.desafio.cantidad == $scope.desafio.puntos.length){
      //enviar a firebase
      //si no hay error $state.go('desafios.juego');
      //si hay error alert('ocurríó un error');
      console.log($scope.desafio);
      
    }

  }


  for (var i = 1; i <= 100; i++) {
    // The number and letter designators
    if (i < 11) {
      angular.element(document.querySelector('.top')).prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      angular.element(document.querySelector('.bottom')).prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      angular.element(document.querySelector('.grid')).append("<li class='points offset1 " + i + "'><span class='hole'></span></li>");
    } else {
      angular.element(document.querySelector('.grid')).append("<li class='points offset2 " + i + "'><span class='hole'></span></li>");
    }
    if (i == 11) {
      angular.element(document.querySelector('.top')).prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
      angular.element(document.querySelector('.bottom')).prepend("<span class='aTops hidezero'>" + Math.abs(i - 11) + "</span>");
    }
    if (i > 90) {
      angular.element(document.querySelector('.top')).append("<span class='aLeft'>" + 
                String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
      angular.element(document.querySelector('.bottom')).append("<span class='aLeft'>" + 
                String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
    }
  }


  
  // initialize the fleet
  playerFleet = new Fleet("Player 1");
  playerFleet.initShips();
  // light up the players ship board for placement
  placeShip(playerFleet.ships[playerFleet.currentShip], playerFleet);





  function Fleet(name) {
  this.name = name;
  this.shipDetails = [{ "name": "carrier", "length": 5 },
            { "name": "battleship", "length": 4 },
            { "name": "cruiser", "length": 3 },
            { "name": "destroyer", "length": 3 },
            { "name": "frigate", "length": 2 }];
  this.numOfShips = this.shipDetails.length;
  this.ships = [];
  this.currentShipSize = 0;
  this.currentShip = 0;
  this.initShips = function() {
    for(var i = 0; i < this.numOfShips; i++) {
      this.ships[i] = new Ship(this.shipDetails[i].name);
      this.ships[i].length = this.shipDetails[i].length;
    }
  };
  this.removeShip = function(pos) {
    this.numOfShips--;
    $(".text").text(output.sunk(this.name, this.ships[pos].name));
    if (this == playerFleet) bot.sizeOfShipSunk = this.ships[pos].length;
    this.ships.splice(pos, 1);
    if (this.ships.length == 0) {
      $(".text").text(output.lost(this.name));
    }
    return true;
  };
  this.shipHit = function(ship_name) {
    $(".text").text(output.hit(this.name));
    return true;
  }
  this.checkIfHit = function(point) {
    for(var i = 0; i < this.numOfShips; i++) {
      if (this.ships[i].checkLocation(point)) {
        this.ships[i].getRidOf(this.ships[i].hitPoints.indexOf(point));
        if (this.ships[i].hitPoints == 0)return this.removeShip(i);
        else return this.shipHit(this.ships[i].name);
      }
    }
    return false;
  };
}


function Ship(name){
  this.name = name;
  this.length = 0;
  this.hitPoints = [];
  this.populateHorzHits = function(start) {
    for (var i = 0; i < this.length; i++, start++) {
      this.hitPoints[i] = start;
    }
  };
  this.populateVertHits = function(start) {
    for (var i = 0; i < this.length; i++, start += 10) {
      this.hitPoints[i] = start;
    }
  };
  this.checkLocation = function(loc) {
    for (var i = 0; i < this.length; i++) {
      if (this.hitPoints[i] == loc) return true;    
    }
    return false;
  };
  this.getRidOf = function(pos) {
    this.hitPoints.splice(pos, 1);
  }
}



function placeShip(ship, fleet) {
  angular.element(document.querySelector('.bottom')).find(".points").off("mouseenter").on("mouseenter", function() {
    var num = $(this).attr('class').slice(15);
    //
    if (orientation == "horz") displayShipHorz(parseInt(num), ship, this, fleet);
    else displayShipVert(parseInt(num), ship, this, fleet);
  });
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
