const express = require("express");
const router = express.Router();

//Controllers
const stripeController = require("../../Controllers/CheckOutService");
const userController = require("../../Controllers/ControllersPerfil/UserController.js");

/**
 * * Cria um sessão no stripe
 */
router.post("/create-checkout-session", stripeController.stripeCheckoutSession);

/**
 * * Rota para criar a nova encomenda
 */
router.post('/saveNewOrder/:userId/:restId', userController.saveNewOrder);

/**
 * * Rota para verificar a distancia 
 * */
router.post("/validateDeliveryRadius", stripeController.validateDistance);

module.exports = router;