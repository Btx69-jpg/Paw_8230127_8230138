const express = require("express");
const router = express.Router();

const authTokenMiddleware = require("../../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../../Middleware/TypeUserMiddleware.js");
const restaurantController = require("../../Controllers/ControllersAdmin/RestaurantController.js")
//Meter como na admin

/*Routers para os restaurantes */
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.homePage);

/* Router para o filtrar os restaurantes */
router.get("/search", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.search);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post("/aproves/:restaurantId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post("/aproves/reject/:restaurantId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.rejectRestaurant);

module.exports = router;