const express = require("express");
const router = express.Router();

//Controllers
const stripeController = require("../../Controllers/CheckOutService");
const userController = require("../../Controllers/ControllersPerfil/UserController.js");

/**
 * * Cria um sessão no stripe
 */
router.post("/create-checkout-session", stripeController.stripeCheckoutSession);

router.post('/saveNewOrder/:userId/:restId', userController.saveNewOrder);

module.exports = router;