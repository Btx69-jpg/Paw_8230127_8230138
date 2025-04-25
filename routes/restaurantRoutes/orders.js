var express = require('express');
var router = express.Router({ mergeParams: true }); 
const mongoose = require('mongoose');

//Controllers 
const order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 

//Middlewares
const {isDonoOrRestaurant} = require("../../Middleware/TypeUserMiddleware.js");

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * isDonoOrRestaurant --> verifica se o utilizador é um dono ou restaurante
 * */
router.use(isDonoOrRestaurant);

/**
 * * Rota que carrega a pagina para gestão das encomendas do restaurante
 * */
router.get('/', order.addOrder);

/**
 * * Rota que carrega a pagina para o restaurante poder criar uma encomenda
 * */
router.get('/createOrder', order.createOrder);

/**
 * * Rota que carrega a pagina para o restaurante gerir as encomendas que estão em andamento
 * */
router.get('/orderManagement', order.orderManagment);

/**
 * * Rota que carrega a pagina, com o historico de encomendas do restaurante
 */
router.get('/historic', order.historicOrder);

/**
 * * Rota que carrega a pagina, com informação de uma encomenda especifica
 */
router.get('historic/:orderId', order.showOrder);

/**
 * * Rota que altera o estado de uma encomenda
 */
router.post('/:orderId/status', order.updateOrderStatus);

module.exports = router;


/* 
Rotas 
router.get('/getMenus', menu.getMenus);
*/



