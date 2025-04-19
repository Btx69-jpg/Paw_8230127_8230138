var express = require('express');
var router = express.Router({ mergeParams: true }); /*Permite desta forma com que o route receba o parametro /:restaurant da route restaurants */

//Controller
var restaurant = require("../Controllers/RestaurantController.js"); // Aqui carrego o controller que quero usar

//Rotas
const order = require("./restaurantRoutes/orders.js");
const dish = require("./restaurantRoutes/dish.js");
const comments = require("./restaurantRoutes/comments.js");

/* Rota que renderiza a home page de um restaurante */
router.get('/', restaurant.homePage);

/* Rota que lista menus e pratos */
router.get('/menus', restaurant.getMenus);

/* Carrega a pagina que mostra informação sobre o menu */
router.get('/showMenu/:menu', restaurant.showMenu);

/* Rota que carrega a pagina para criar um menu  */
router.get('/createMenu', restaurant.createMenu);

/*Rota que renderiza a pagina para editar um menu */
router.get('/editMenu/:menuId', restaurant.editMenu);

/* Rota que dá update a um menu */
router.post('/updateMenu/:menuId', restaurant.saveEditMenu);

/* Rota que dá delete a um menu */
router.post('/deleteMenu/:menuId', restaurant.deleteMenu);

//Outros route
/* Redireciona para o route das orders */
router.use('/orders', order);

/* Redireciona para o route dos comentarios */
router.use('/comments', comments);

/* Redireciona para a route das dish */
router.use('/menu', dish);

module.exports = router;