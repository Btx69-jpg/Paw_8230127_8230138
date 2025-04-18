const express = require("express");
const router = express.Router();

//Middlewares
const authTokenMiddleware = require("../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../Middleware/TypeUserMiddleware.js");

const restaurantsController = require("../Controllers/RestaurantsController.js");

//Pagina do admin
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isCliente, restaurantsController.createRestaurant);

//Rota para guardar um restaurante na lista de aprovação
router.post("/saveRestaurant", authTokenMiddleware.authenticateToken, typeUserMiddleware.isCliente, restaurantsController.saveRestaurant);

module.exports = router;