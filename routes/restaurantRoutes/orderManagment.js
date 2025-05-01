var express = require('express');
var router = express.Router({ mergeParams: true }); 
const mongoose = require('mongoose');

//Controllers 
const order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 

/**
 * * Rota que carrega a pagina para o restaurante gerir as encomendas que estão em andamento
 * */
router.get('/', order.orderManagment);

/**
 * * Rota que eliminar uma encomenda
 * */
router.post('/cancelOrder/:orderId', order.deleteOrder);

/**
 * * Rota que atualiza o estado de uma encomenda
 * */
router.post('/updateStatus/:orderId', order.updateOrderStatus);

/**
 * * Rota que filtra as encomendas
 * */
//router.get('/searchOrder', order.searchOrder);

module.exports = router;