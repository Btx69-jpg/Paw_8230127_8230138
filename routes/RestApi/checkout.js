const express = require("express");
const router = express.Router();

//Controllers
const stripeController = require("../../Controllers/CheckOutService");
const userController = require("../../Controllers/ControllersPerfil/UserController.js");
const restauranteApiController = require("../../Controllers/ControllersRestaurant/RestApiRestaurantController.js")

/**
 * * Cria um sessão no stripe
 */
router.post("/create-checkout-session", stripeController.stripeCheckoutSession);

router.get('/limparCarrinho/:UserId', userController.cleanCart);

router.get('/obterCarrinho/:UserId', userController.getCart);

router.post('/save/:UserId', userController.saveCart);

/**
 * * Rota para retornar os dados de um restaurante especifico
 */
router.get('/getRestaurante/:restId', restauranteApiController.getRestaurante);

router.post('/saveNewOrder/:UserId/:restId', userController.saveNewOrder);

module.exports = router;