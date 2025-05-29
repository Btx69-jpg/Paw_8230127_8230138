var express = require('express');
var router = express.Router({ mergeParams: true }); 
const app = express();
const mongoose = require('mongoose');

//Controllers 
const order = require("../../Controllers/ControllersRestaurant/OrderController.js"); 

//Rotas
const orderManagment = require("./orderManagment.js");

//Middlewares
const { isDonoOrRestaurant } = require("../../Middleware/TypeUserMiddleware.js");
const { validateRestauranteDonoOrRest } = require("../../Middleware/ValidateRestauranteMiddleware");
/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * isDonoOrRestaurant --> verifica se o utilizador é um dono ou restaurante
 * */
router.use(isDonoOrRestaurant, validateRestauranteDonoOrRest);

/**
 * * Rota que carrega a pagina para gestão das encomendas do restaurante
 * */
router.get('/', order.addOrder);

/**
 * * Rota que carrega a pagina para o restaurante poder criar uma encomenda
 * */
router.post('/saveOrder', order.saveOrder);

/**
 * * Importação das rotas de gestão de encomendas
 * */
router.use('/orderManagement', orderManagment);

/**
 * * Rota que carrega a pagina, com o historico de encomendas do restaurante
 */
router.get('/historic', order.historicOrder);

/**
 * * Rota que carrega a pagina, com informação de uma encomenda especifica
 */
router.get('/historic/:orderId', order.showOrder);

module.exports = router;