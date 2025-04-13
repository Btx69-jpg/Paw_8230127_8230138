const express = require("express");
const router = express.Router();

const restaurantController = require("../../Controllers/ControllersAdmin/RestaurantController.js")

/*Routers para os restaurantes */
router.get("/", restaurantController.homePage);

/* Router para o filtrar os restaurantes */
router.get("/search", restaurantController.search);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", restaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post("/aproves/:restaurantId",restaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post("/aproves/reject/:restaurantId", restaurantController.rejectRestaurant);

module.exports = router;