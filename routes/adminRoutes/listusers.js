const express = require("express");
const router = express.Router();

const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../../Middleware/TypeUserMiddleware.js");
const userController = require("../../Controllers/ControllersAdmin/UsersController.js");

router.use(authenticateToken, isAdmin);

/*Routers para os users */
router.get("/", userController.homePage);

/* Route para realizar filtros aos dados */
router.get("/search", userController.search);

/* Carrega a pagina de criação do utilizador */
router.get("/createUser", userController.createUser);

/* Guarda um novo utilizador na BD */
router.post("/createUser", userController.saveUser);

/* Carrega a pagina de criação do utilizador */
router.get("/editUser/:userId", userController.editPage);

/* Edita os dados do utilizador */
router.post("/editUser/:userId", userController.updateUser);

/* Permite apagar um user */
router.post("/delete/:userId", userController.deleteUser);

/*Desbanir um user manualmente */
router.post("/desban/:userId", userController.desban);

/* Banir um utilizador */
router.post("/ban/:userId", userController.ban);

module.exports = router;