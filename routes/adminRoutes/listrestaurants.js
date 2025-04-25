const express = require("express");
const router = express.Router();

//Controllers
const restaurantsController = require("../../Controllers/RestaurantsController.js");
const listrestaurantController = require("../../Controllers/ControllersAdmin/ListRestaurantController.js")

//Middlewares
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../../Middleware/TypeUserMiddleware.js");

/**
 * * Rota que aplica as restantes a autentificação/validação do token
 */
router.use(authenticateToken, isAdmin);

/** 
 * * Routers para os restaurantes 
 * */
router.get('/', listrestaurantController.homePage);

/** 
 * * Routers para visualizar os dados de um restaurante especifico 
 * */
router.get('/showRest/:restaurantId', listrestaurantController.showRestaurant);

/**
 * * Router para o filtrar os restaurantes 
 * */
router.get('/search', restaurantsController.search);

/**
 * * Rota para renderizar a pagina para criar restaurante 
 * */
router.get('/createRestaurant', restaurantsController.createRestaurant)

/**
 * * Rota para guardar novos Restaurantes
 * */
router.post('/saveRestaurant', restaurantsController.saveRestaurant)

/**
 * * Rota para renderizar a pagina para editar restaurante
 * 
 * * restaurantId --> Id do restuarante que vai ser editado
 * */
router.get('/editRestaurant/:restaurantId', restaurantsController.editRestaurant)

/**
 * * Rota que guarda as alterações realizas a um restaurante 
 * 
 * * restaurantId --> Id do restuarante que vai ser atualizado
 * */
router.post('/updatRestaurant/:restaurantId', restaurantsController.updatRestaurant);

/**
 * * Rota para dar delete de um restaurante
 * 
 * * restaurant --> Id do restuarante que vai ser removido
 * */
router.post('/deleteRestaurant/:restaurant', restaurantsController.removeRestaurant);

/**
 * * Rota que carrega a página para aprovar ou rejeitar restaurantes 
 * */
router.get('/aproves', listrestaurantController.aprovePage);

/**
 * * Rota para aprovar um restaurante, atualizando o seu estado como aprovo, permitinfo com que o mesmo
 * * possa ser visualizado pelos os utilizadores
 * 
 * * restaurantId --> Id do restuarante que vai ser aprovado
 */
router.post('/aproves/:restaurantId', listrestaurantController.aproveRestaurant);

/**
 * * Rota que rejeita um rejeita um restaurante, removendo-o da DB
 * 
 * * restaurantId --> Id do restuarante que vai ser desaprovado
 */
router.post('/aproves/reject/:restaurantId', listrestaurantController.rejectRestaurant);

module.exports = router;