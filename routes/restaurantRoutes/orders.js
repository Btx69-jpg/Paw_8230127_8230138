var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

//Controllers 
var order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 

//rota para gestão de pedidos para o restaurante
//router.get('/orderManagement', restaurant.orderManagement);

/**
router.get('/createOrder', restaurant.getOrders);

router.post('/saveOrder', )

router.post('/orders', restaurant.createOrder);

router.put('/orders/:orderId/status', restaurant.updateOrderStatus);
 
 */
module.exports = router;
