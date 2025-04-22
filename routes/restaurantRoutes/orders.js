var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

//Controllers 
const order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 
const menu = require("../../Controllers/ControllersRestaurant/MenuController.js")
//rota para gestão de pedidos para o restaurante

const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isDonoOrRestaurant} = require("../../Middleware/TypeUserMiddleware.js");

//Rota que aplica a verificação de token e validação de user às restantes
router.use(authenticateToken, isDonoOrRestaurant);

router.get('/', order.addOrder);

router.get('/createOrder', order.createOrder);

router.get('/orderManagement', order.orderManagment);

router.get('/historic', order.historicOrder);

router.get('historic/:orderId', order.showOrder);
//router.post('/saveOrder', order.)

//router.post('/getOrders', order.createOrder);

router.put('/:orderId/status', order.updateOrderStatus);
 
/* Rota que lista menus e pratos */
router.get('/getMenus', menu.getMenus);

module.exports = router;
