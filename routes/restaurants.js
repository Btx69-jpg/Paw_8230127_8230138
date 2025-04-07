var express = require('express');
var router = express.Router();

var restaurants = require("../Controllers/RestaurantsController.js"); // Aqui carrego o controller que quero usar

/* Entra na Home Page do restaurante 
(vai ter de carregar, o restaurante carregado na primeira página) */ 
router.get('/', function(req, res) {
    restaurants.restaurantsPage(req, res, "restaurants/restaurants");
});

router.get('/createRestaurant', function(req, res) {
    restaurants.createRestaurant(req, res, "restaurants/crudRestaurantes/addRestaurant");
});

router.post('/saveRestaurant', function(req, res) {
    restaurants.saveRestaurant(req, res, "/restaurants", "restaurants/crudRestaurantes/addRestaurant");
});

router.get('/editRestaurant/:restaurantId', function(req, res) {
    restaurants.editRestaurant(req, res, "restaurants/crudRestaurantes/editRestaurant", "/restaurants");
});

router.post('/updatRestaurant/:restaurantId', function(req, res) {
    restaurants.updatRestaurant(req, res, "/restaurants", "restaurants/crudRestaurantes/editRestaurant");
});

router.get('/editRestaurant/editPassword/:restaurantId', function(req, res) {
    restaurants.editPassword(req, res, "restaurants/crudRestaurantes/editPassword", "restaurants/crudRestaurantes/editRestaurant");
});

router.post('/editRestaurant/changePassword/:restaurantId', function(req, res) {
    restaurants.updatePassword(req, res, "restaurants/crudRestaurantes/editRestaurant", "restaurants/crudRestaurantes/editRestaurant");
});

router.post('/deleteRestaurant/:restaurant', function(req, res) {
    restaurants.removeRestaurant(req, res, "/restaurants");
});

/*Depois criar os get e post para criar os varios restaurantes */

module.exports = router;
