var express = require('express');
var router = express.Router({ mergeParams: true }); 

//Controller
var restaurant = require("../Controllers/RestaurantController.js");
var user = require("../Controllers/ControllersPerfil/UserController.js");
var menu = require("../Controllers/ControllersRestaurant/MenuController.js");
const { editRestaurant, updatRestaurant } = require("../Controllers/RestaurantsController.js");
//Middlewares
const { authenticateToken } = require("../Middleware/AuthTokenMiddleware.js");
const { isDonoOrAdmin, isDonoOrCliente } = require("../Middleware/TypeUserMiddleware.js");
const { validateRestauranteDonoAndAdmin } = require("../Middleware/ValidateRestauranteMiddleware.js")
//Rotas
const order = require("./restaurantRoutes/orders.js");
const comments = require("./restaurantRoutes/comments.js");

/**
 * * Rota que renderiza a home page de um restaurante
 * */
router.get('/', restaurant.homePage);

/**
 * * Importação das rotas dos comentarios
 * */
router.use('/comments', comments);

/**
 * * Rota para a pagina que mostra informação sobre o menu
 * */
router.get('/showMenu/:menu', menu.showMenu);

/**
 * * Rota que permite filtrar por menus, de um restaurante, e também ordenar os menus
 * */
router.get('/search', restaurant.searchMenu);

/**
 * * Rota que permite filtrar pelos pratos, de um menu, e também ordenar os menus
 * */
router.get('/showMenu/:menu/search', menu.searchMenu);

/**
 * * Importação das rotas das encomendas
 * */
router.use('/orders', authenticateToken, order);

/**
 * * Rota para adicionar um prato ao carrinho de compras
 * */
router.post('/addToCart/:dishId/:portionId/:menu', authenticateToken, isDonoOrCliente, user.addToCart);

/**
 * * Rota que carrega a página para edição dos dados do restaurante
 */
router.get('/editDados/:restaurantId', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, editRestaurant);

/**
 * * Rota que atualiza os dados de um restaurante
 */
router.post('/updateDados/:restaurantId', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, updatRestaurant);

/**
 * * Rota que carrega a pagina para criar um menu
 * */
router.get('/createMenu', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.createMenu);

/**
 * * Rota que carrega a pagina para editar um menu
 * 
 * * menuId --> id do menu a ser editado
 * */
router.get('/editMenu/:menuId', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.editMenu);

/**
 * * Rota guardar as alterações realizadas num menu
 * 
 * * menuId --> id do menu a ser atualizado
 * */
router.post('/updateMenu/:menuId', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.saveEditMenu);

/**
 * * Rota que elimina um menu
 * 
 * * menuId --> id do menu a ser eliminado
 * */
router.post('/deleteMenu/:menuId', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.deleteMenu);

// Nova rota para validação nutricional do prato do menu
router.post('/confirmNutrition', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.validateNutrition);

router.post('/saveMenuFinal', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.saveMenuFinal);

router.post('/validateIngredient', authenticateToken, isDonoOrAdmin, validateRestauranteDonoAndAdmin, menu.validateIngredient);

module.exports = router;