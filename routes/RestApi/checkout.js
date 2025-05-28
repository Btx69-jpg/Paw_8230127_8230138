/**
 * !Wilkie quando estiver feito a url de conclusão da encomenda, tens
 * !de pegar no codigo que fiz para o toast e meter lá pois aquilo por enquanto
 * !funciona para teste mas depois tem de estar nessa rota
 * 
 */
const express = require("express");
const router = express.Router();

//Controllers
const stripeController = require("../../Controllers/CheckOutService");
const userController = require("../../Controllers/ControllersPerfil/UserController.js");

router.post("/create-checkout-session", stripeController.stripeCheckoutSession);

router.get('/limparCarrinho/:UserId', userController.cleanCart);

router.get('/obterCarrinho/:UserId', userController.getCart);

router.post('/save/:UserId', userController.saveCart);

router.get('/getRestName&Address/:restId', userController.getRestNameAndAddress);

router.post('/saveNewOrder/:UserId/:restId', userController.saveNewOrder);

module.exports = router;