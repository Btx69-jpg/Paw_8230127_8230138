const express = require("express");
const router = express.Router();

const restaurantController = require("../../Controllers/ControllersAdmin/RestaurantController.js")

/*Routers para os restaurantes */
router.get("/", function(req, res) {
    restaurantController.homePage(req, res);
});

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", function(req, res) {
    restaurantController.aprovePage(req, res);
});

router.post("/aproves/:restaurantId", function(req, res) {
    restaurantController.aproveRestaurant(req, res);
});

//Incompleto
router.delete("/aproves/reject/:restaurantId", function(req, res) {
    restaurantController.rejectRestaurant(req, res);
});

module.exports = router;