const express = require("express");
const router = express.Router();

//Middlewares
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../../Middleware/TypeUserMiddleware.js");

//Controllers
const restaurantsController = require("../../Controllers/RestaurantsController.js");
const listrestaurantController = require("../../Controllers/ControllersAdmin/ListRestaurantController.js")

/**
 * Rota que aplica as restantes a autentificação/validação do token
 */
router.use(authenticateToken, isAdmin);

/** 
 * Routers para os restaurantes 
 * */
router.get('/', listrestaurantController.homePage);

/** 
 * Routers para visualizar os dados de um restaurante especifico 
 * */
router.get('/showRest/:restaurantId', listrestaurantController.showRestaurant);

/* Router para o filtrar os restaurantes */
router.get('/search', restaurantsController.search);

/* Rota para renderizar a pagina para criar restaurante */
router.get('/createRestaurant', restaurantsController.createRestaurant)

/* Rota para guardar novos Restaurantes */
router.post('/saveRestaurant', restaurantsController.saveRestaurant)

/* Rota para renderizar a pagina para editar restaurante */
router.get('/editRestaurant/:restaurantId', restaurantsController.editRestaurant)

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', restaurantsController.updatRestaurant);

/* Rota para dar delete de um restaurante */
router.post('/deleteRestaurant/:restaurant', restaurantsController.removeRestaurant);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get('/aproves', listrestaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post('/aproves/:restaurantId', listrestaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post('/aproves/reject/:restaurantId', listrestaurantController.rejectRestaurant);

module.exports = router;