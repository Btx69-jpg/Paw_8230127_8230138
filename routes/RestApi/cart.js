const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/ControllersPerfil/UserController.js");
const restauranteApiController = require("../../Controllers/ControllersRestaurant/RestApiRestaurantController.js")

/**
 * * Rota para limpar o Carrinho do utilizador
 */
router.get('/limparCarrinho/:userId', userController.cleanCart);

/**
 * * Rota que retorna o carrinho do utilizador
 */
router.get('/obterCarrinho/:userId', userController.getCart);

/**
 * * Rota para guardar o carrinho do utilizador
 */
router.post('/save/:userId', userController.saveCart);

/**
 * * Rota para retornar os dados de um restaurante especifico
 */
router.get('/getRestaurante/:restId', restauranteApiController.getRestaurante);
module.exports = router;