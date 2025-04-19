var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

//Controllers 
var order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 

//rota para gestão de pedidos para o restaurante

router.get('/', order.orderManagement);

router.get('/createOrder', order.createOrder);

//router.post('/saveOrder', order.)

//router.post('/orders', order.createOrder);

router.put('/:orderId/status', order.updateOrderStatus);
 
module.exports = router;
