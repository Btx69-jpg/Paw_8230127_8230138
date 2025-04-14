const express = require("express");
const router = express.Router();

const authController = require("../../Controllers/AuthController.js");
const typeUser = require("../functions/typeUser.js");
const restaurantController = require("../../Controllers/ControllersAdmin/RestaurantController.js")
//Meter como na admin

/*Routers para os restaurantes */
router.get("/", authController.authenticateToken, typeUser.isAdmin, restaurantController.homePage);

/* Router para o filtrar os restaurantes */
router.get("/search", authController.authenticateToken, typeUser.isAdmin, restaurantController.search);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", authController.authenticateToken, typeUser.isAdmin, restaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post("/aproves/:restaurantId", authController.authenticateToken, typeUser.isAdmin, restaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post("/aproves/reject/:restaurantId", authController.authenticateToken, typeUser.isAdmin, restaurantController.rejectRestaurant);

module.exports = router;