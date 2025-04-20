/**
 * ! Falta meter o search a ser reaproveitado, pelo o do restaurantsController, e modificar o mesmo, claro
 */
const express = require("express");
const router = express.Router();

const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isAdmin, isDonoRestaurantOrAdmin} = require("../../Middleware/TypeUserMiddleware.js");
const listrestaurantController = require("../../Controllers/ControllersAdmin/ListRestaurantController.js")

const restaurantsController = require("../../Controllers/RestaurantsController.js");

/*Routers para os restaurantes */
router.get("/", authenticateToken, isAdmin, listrestaurantController.homePage);

/* Router para o filtrar os restaurantes */
router.get("/search", authenticateToken, isAdmin, restaurantsController.search);

/* Rota para renderizar a pagina para criar restaurante */
router.get("/createRestaurant", authenticateToken, isAdmin, restaurantsController.createRestaurant)

/* Rota para guardar novos Restaurantes */
router.get("/saveRestaurant", authenticateToken, isAdmin, restaurantsController.saveRestaurant)

/* Rota para renderizar a pagina para editar restaurante */
router.get("/editRestaurant/:restaurantId", authenticateToken, isAdmin, restaurantsController.editRestaurant)

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', authenticateToken, isDonoRestaurantOrAdmin, restaurantsController.updatRestaurant);

/* Rota para dar delete de um restaurante */
router.post('/deleteRestaurant/:restaurant', authenticateToken, isDonoRestaurantOrAdmin, restaurantsController.removeRestaurant);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", authenticateToken, isAdmin, listrestaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post("/aproves/:restaurantId", authenticateToken, isAdmin, listrestaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post("/aproves/reject/:restaurantId", authenticateToken, isAdmin, listrestaurantController.rejectRestaurant);

module.exports = router;