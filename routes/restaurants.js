var express = require('express');
var router = express.Router();

const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isDonoRestaurantOrAdmin, isDonoOrRestaurant} = require("../Middleware/TypeUserMiddleware.js");
const restaurants = require("../Controllers/RestaurantsController.js"); 
const passwordController = require("../Controllers/PasswordController.js");

//Routes
const routeRestaurant = require("./restaurant.js");

/* Renderiza a homePage do restaurante */
router.get('/', restaurants.restaurantsPage);

/* Permite filtrar por restuarantes 
Reaproveitar também no restaurant do admin
*/
router.get('/search', restaurants.search);

/* Renderiza a página para criar um novo restaurante */
router.get('/createRestaurant', authenticateToken, isDonoRestaurantOrAdmin, restaurants.createRestaurant);

/* Guarda um novo restaurante */
router.post('/saveRestaurant', authenticateToken, isDonoRestaurantOrAdmin, restaurants.saveRestaurant);

/* Renderiza a pagina para editar um restaurante */
router.get('/editRestaurant/:restaurantId', authenticateToken, isDonoRestaurantOrAdmin, restaurants.editRestaurant);

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', authenticateToken, isDonoRestaurantOrAdmin, restaurants.updatRestaurant);

/* Renderiza a pagina para editar a password */
router.get('/editRestaurant/editPassword/:accountId', authenticateToken, isDonoOrRestaurant, passwordController.editPassword);

/* Atualiza a password do utilizador */
router.post('/editRestaurant/changePassword/:accountId', authenticateToken, isDonoOrRestaurant, passwordController.updatePassword);

/* Dá delete a um restaurante */
router.post('/deleteRestaurant/:restaurant', authenticateToken, isDonoRestaurantOrAdmin, restaurants.removeRestaurant);

/* Leva para a route de um restaurante (especifico) */
router.use('/:restaurant', routeRestaurant);

module.exports = router;
