const express = require("express");
const router = express.Router();

const authTokenMiddleware = require("../../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../../Middleware/TypeUserMiddleware.js");
const userController = require("../../Controllers/ControllersAdmin/UsersController.js");

//Meter como na admin

/*Routers para os users */
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.homePage);

/* Route para realizar filtros aos dados */
router.get("/search", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.search);

/* Carrega a pagina de criação do utilizador */
router.get("/createUser", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.createUser);

/* Guarda um novo utilizador na BD */
router.post("/createUser", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.saveUser);

/* Carrega a pagina de criação do utilizador */
router.get("/editUser/:userId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.editPage);

/* Edita os dados do utilizador */
router.post("/editUser/:userId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.updateUser);

/* Permite apagar um user */
router.post("/delete/:userId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.deleteUser);

/*Desbanir um user manualmente */
router.post("/desban/:userId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.desban);

/* Banir um utilizador */
router.post("/ban/:userId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userController.ban);

module.exports = router;