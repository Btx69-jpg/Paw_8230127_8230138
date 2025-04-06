/*Aqui e o nosso HomePage, que vai ter o cmainho,
para a pagina principal, com o menu, avaliações
E também para a pagina com os pratos do menu
*/
var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');

var restaurants = require("../Controllers/RestaurantsController.js"); // Aqui carrego o controller que quero usar

/* Entra na Home Page do restaurante 
(vai ter de carregar, o restaurante carregado na primeira página) */ 
router.get('/', function(req, res) {
    restaurants.restaurantsPage(req, res);
});

router.get('/createRestaurant', function(req, res) {
    restaurants.createRestaurant(req, res);
});

router.post('/saveRestaurant', function(req, res) {
    restaurants.saveRestaurant(req, res);
});

router.get('/editRestaurant/:restaurantId', function(req, res) {
    restaurants.editRestaurant(req, res);
});

router.post('/updatRestaurant/:restaurantId', function(req, res) {
    restaurants.updatRestaurant(req, res);
});

router.get('/editRestaurant/editPassword/:restaurantId', function(req, res) {
    restaurants.editPassword(req, res);
});

router.post('/editRestaurant/changePassword/:restaurantId', function(req, res) {
    restaurants.updatePassword(req, res);
});

router.post('/deleteRestaurant/:restaurant', function(req, res) {
    restaurants.removeRestaurant(req, res);
});

/*Depois criar os get e post para criar os varios restaurantes */

module.exports = router;
