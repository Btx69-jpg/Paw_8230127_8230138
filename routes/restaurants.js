var express = require('express');
var router = express.Router();

const authTokenMiddleware = require("../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../Middleware/TypeUserMiddleware.js");
var restaurants = require("../Controllers/RestaurantsController.js"); 

/* Renderiza a homePage do restaurante */
router.get('/', restaurants.restaurantsPage);

/* Permite filtrar por restuarantes 
Reaproveitar também no restaurant do admin
*/
router.get('/search', restaurants.search);

/* Renderiza a página para criar um novo restaurante */
router.get('/createRestaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurants.createRestaurant);

/* Guarda um novo restaurante */
router.post('/saveRestaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, function(req, res) {
    restaurants.saveRestaurant(req, res, "/restaurants", "restaurants/crudRestaurantes/addRestaurant");
});

/* Renderiza a pagina para editar um restaurante */
router.get('/editRestaurant/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurants.editRestaurant);

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurants.updatRestaurant);

/* Renderiza a pagina para editar a password */
router.get('/editRestaurant/editPassword/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoOrRestaurant, restaurants.editPassword);

/* Atualiza a password do utilizador */
router.post('/editRestaurant/changePassword/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoOrRestaurant, restaurants.updatePassword);
/* Dá delete a um restaurante */
router.post('/deleteRestaurant/:restaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurants.removeRestaurant);

module.exports = router;
