const express = require("express");
const router = express.Router();

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isDonoOrCliente} = require("../Middleware/TypeUserMiddleware.js");

//Controller
const restaurantsController = require("../Controllers/RestaurantsController.js");

/**
 * Rota que aplica às restantes a verficação/autentificação do token e validada se quem está logado
 * é um cliente ou dono.
 */
router.use(authenticateToken, isDonoOrCliente)

/**
 * Rota que renderiza a pagina para um user ou Dono poder criar o seu restaurante.
 */
router.get("/", restaurantsController.createRestaurant);

/**
 * Rota que guarda um restaurante, deixando-lo na lista de aprovação do admin, criado pelo user.
 */
router.post("/saveRestaurant", restaurantsController.saveRestaurant);

module.exports = router;