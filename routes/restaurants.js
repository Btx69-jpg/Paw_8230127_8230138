var express = require('express');
var router = express.Router();

//Controllers
const restaurants = require("../Controllers/RestaurantsController.js"); 
const passwordController = require("../Controllers/PasswordController.js");

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isDonoClienteOrAdmin, isDonoOrAdmin, isRestaurant, isAdmin} = require("../Middleware/TypeUserMiddleware.js");

//Router
const routeRestaurant = require("./restaurant.js");

/**
 * * Rota que carrega a pagina com todos os restaurantes do site, aprovados.
 * */
router.get('/', restaurants.restaurantsPage);

/**
 * * Página que filtrar pelos restaurantes, e definir o criterio de ordenação.
 * */
router.get('/search', restaurants.search);

/**
 * * Rota que carrega o router com as rotas padrão para a pagina de cada restaurante
 */
router.use('/:restaurant', routeRestaurant);

/**
 * * Rota que aplicar a todas as rotas deste js o suguinte middlewar
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * */
router.use(authenticateToken);

/**
 * * Rota que renderiza a página de criação de um restaurante, caso o utilizador seja admin ou
 * * a página de pedido de criação de um restaurante caso o utilizador seja um dono ou cliente
 * 
 * * isDonoClienteOrAdmin --> verifica se o user é um dono, cliente ou admin
 * * authenticateToken --> valida se o token do utilizador é valido.
 * */
router.get('/createRestaurant', isAdmin, restaurants.createRestaurant);

/**
 * * Rota que guarda um novo restaurante, caso o utilizador seja admin ou guarda um pedido de 
 * * criação de um restaurante caso o utilizador seja um dono ou cliente
 * 
 * * isDonoClienteOrAdmin --> verifica se o user é um dono, cliente ou admin
 * * authenticateToken --> valida se o token do utilizador é valido.
 * */
router.post('/saveRestaurant', isDonoClienteOrAdmin, restaurants.saveRestaurant);

/**
 * * Rota que renderiza a pagina de edição dos caso o utilizar seja o dono do próprio restaurante
 * * ou um admin.
 * 
 * * isDonoOrAdmin --> verifica se o user é um dono ou admin
 * */
router.get('/editRestaurant/:restaurantId', isDonoOrAdmin, restaurants.editRestaurant);

/**
 * * Rota que permite guardar os dados, alterados de um restaurante, pelo dono ou admin
 * 
 * * isDonoOrAdmin --> verifica se o user é um dono ou admin
 * */
router.post('/updatRestaurant/:restaurantId', isDonoOrAdmin, restaurants.updatRestaurant);

/**
 * * Rota que permite ao restaurante alterar a password da sua conta
 * 
 * * isRestaurant --> verifica se o user é um restaurante
 * */
router.get('/editRestaurant/editPassword/:accountId', isRestaurant, passwordController.editPassword);

/**
 * * Rota que permite ao restaurante guaradar a sua nova password
 * 
 * * isRestaurant --> verifica se o user é um restaurante
 * */
router.post('/editRestaurant/changePassword/:accountId', isRestaurant, passwordController.updatePassword);

/**
 * * Rota que dá delete de um restaurante no site, por parte do dono ou de um admin
 * 
 * * isDonoOrAdmin --> verifica se o user é um dono ou admin
 * */
router.post('/deleteRestaurant/:restaurant', isDonoOrAdmin, restaurants.removeRestaurant);

module.exports = router;
