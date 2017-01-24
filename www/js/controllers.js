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
    $state.go('ranking');
  }

  $scope.About = function(){
    $state.go('about');
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

.controller('DesafioNuevoCtrl', function($scope) {
  $scope.nuevoDesafio = {};
  

});
