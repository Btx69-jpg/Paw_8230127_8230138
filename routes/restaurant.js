var express = require('express');
var router = express.Router({ mergeParams: true }); /*Permite desta forma com que o route receba o parametro /:restaurant da route restaurants */

//Controller
var restaurant = require("../Controllers/RestaurantController.js"); // Aqui carrego o controller que quero usar
var menu = require("../Controllers/ControllersRestaurant/MenuController.js");

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isDonoOrAdmin} = require("../Middleware/TypeUserMiddleware.js");

//Rotas
const order = require("./restaurantRoutes/orders.js");
const dish = require("./restaurantRoutes/dish.js");
const comments = require("./restaurantRoutes/comments.js");

/* Rota que renderiza a home page de um restaurante */
router.get('/', restaurant.homePage);

//Carregamento das restantes rotas
/* Redireciona para o route das orders */
router.use('/orders', order);

/* Redireciona para o route dos comentarios */
router.use('/comments', comments);

/* Redireciona para a route das dish */
router.use('/menu', dish);

/* Carrega a pagina que mostra informação sobre o menu */
router.get('/showMenu/:menu', menu.showMenu);

/* Rota para filtrar os menus */
router.get('/search', restaurant.searchMenu);

/* Carrega a pagina que mostra informação sobre o menu */
router.get('/showMenu/:menu/search', menu.searchMenu);

/*Rota para utilizar os middlewares nas routas abaixo */
router.use(authenticateToken, isDonoOrAdmin);

/* Rota que carrega a pagina para criar um menu  */
router.get('/createMenu', menu.createMenu);

/* Rota para dar save de menu */
router.post('/saveMenu', menu.saveMenu);

/*Rota que renderiza a pagina para editar um menu */
router.get('/editMenu/:menuId', menu.editMenu);

/* Rota que dá update a um menu */
router.post('/updateMenu/:menuId', menu.saveEditMenu);

/* Rota que dá delete a um menu */
router.post('/deleteMenu/:menuId', menu.deleteMenu);

module.exports = router;