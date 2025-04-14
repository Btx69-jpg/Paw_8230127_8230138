var express = require('express');
var router = express.Router();

const authTokenMiddleware = require("../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../Middleware/TypeUserMiddleware.js");
var restaurants = require("../Controllers/RestaurantsController.js"); 

/* Renderiza a homePage do restaurante */
router.get('/', function(req, res) {
    restaurants.restaurantsPage(req, res, "restaurants/restaurants");
});

/* Permite filtrar por restuarantes */
router.get('/search', function(req, res) {
    restaurants.search(req, res);
});

/* Renderiza a página para criar um novo restaurante */
router.get('/createRestaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin,  function(req, res) {
    restaurants.createRestaurant(req, res, "restaurants/crudRestaurantes/addRestaurant");
});

/* Guarda um novo restaurante */
router.post('/saveRestaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.saveRestaurant(req, res, "/restaurants", "restaurants/crudRestaurantes/addRestaurant");
});

/* Renderiza a pagina para editar um restaurante */
router.get('/editRestaurant/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.editRestaurant(req, res, "restaurants/crudRestaurantes/editRestaurant", "/restaurants");
});

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.updatRestaurant(req, res, "/restaurants", "restaurants/crudRestaurantes/editRestaurant");
});

/* Renderiza a pagina para editar a password */
router.get('/editRestaurant/editPassword/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin,  function(req, res) {
    restaurants.editPassword(req, res, "restaurants/crudRestaurantes/editPassword", "restaurants/crudRestaurantes/editRestaurant");
});

/* Atualiza a password do utilizador */
router.post('/editRestaurant/changePassword/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.updatePassword(req, res, "restaurants/crudRestaurantes/editRestaurant", "restaurants/crudRestaurantes/editRestaurant");
});

/* Dá delete a um restaurante */
router.post('/deleteRestaurant/:restaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.removeRestaurant(req, res, "/restaurants");
});

module.exports = router;
