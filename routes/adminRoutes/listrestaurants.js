/**
 * ! Também falta mudar o botão para voltar, dos cruds
 */
const express = require("express");
const router = express.Router();

const authTokenMiddleware = require("../../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../../Middleware/TypeUserMiddleware.js");
const restaurantController = require("../../Controllers/ControllersAdmin/RestaurantController.js")

const restaurantsController = require("../../Controllers/RestaurantsController.js");

/*Routers para os restaurantes */
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.homePage);

/* Router para o filtrar os restaurantes */
router.get("/search", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.search);

/* Rota para renderizar a pagina para criar restaurante */
router.get("/createRestaurant", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantsController.createRestaurant)

router.get("/saveRestaurant", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantsController.saveRestaurant)

/* Rota para renderizar a pagina para editar restaurante */
router.get("/editRestaurant/:restaurantId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantsController.editRestaurant)

/* Guarda as alterações feitas a um restaurante */
router.post('/updatRestaurant/:restaurantId', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurantsController.updatRestaurant);

/* Rota para dar delete de um restaurante */
router.post('/deleteRestaurant/:restaurant', authTokenMiddleware.authenticateToken, typeUserMiddleware.isDonoRestaurantOrAdmin, restaurantsController.removeRestaurant);

/*Pagina para aprovar ou rejeitar restaurantes */
router.get("/aproves", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.aprovePage);

/* Aprova um restaurante metendo-o como aprove */
router.post("/aproves/:restaurantId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.aproveRestaurant);

/* Rejeita o restaurante apagando-o da BD */
router.post("/aproves/reject/:restaurantId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantController.rejectRestaurant);

module.exports = router;