const express = require("express");
const router = express.Router();

//Controller
const restaurantsController = require("../Controllers/RestaurantsController.js");

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isDonoOrCliente} = require("../Middleware/TypeUserMiddleware.js");

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * * isDonoOrCliente --> verifica se o utilizador autenticado é um Dono ou cliente
 * */
router.use(authenticateToken, isDonoOrCliente)

/**
 * * Rota que renderiza a página de pedido de criação de um restaurante, no site. Que após
 * * a criação do mesmo o admin poderá aprova-lo ou rejeita-lo.
 * */
router.get("/", restaurantsController.createRestaurant);

/**
 * * Rota que guarda o pedido de criação de um restaurante
 * */
router.post("/saveRestaurant", restaurantsController.saveRestaurant);

module.exports = router;