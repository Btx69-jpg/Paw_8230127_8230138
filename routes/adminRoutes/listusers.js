const express = require("express");
const router = express.Router();

const authController = require("../../Controllers/AuthController.js");
const typeUser = require("../functions/typeUser.js");
const userController = require("../../Controllers/ControllersAdmin/UsersController.js");

//Meter como na admin

/*Routers para os users */
router.get("/", authController.authenticateToken, typeUser.isAdmin, userController.homePage);

/* Route para realizar filtros aos dados */
router.get("/search", authController.authenticateToken, typeUser.isAdmin, userController.search);

/* Carrega a pagina de criação do utilizador */
router.get("/createUser", authController.authenticateToken, typeUser.isAdmin, userController.createUser);

/* Guarda um novo utilizador na BD */
router.post("/createUser", authController.authenticateToken, typeUser.isAdmin, userController.saveUser);

/* Carrega a pagina de criação do utilizador */
router.get("/editUser/:userId", authController.authenticateToken, typeUser.isAdmin, userController.editPage);

/* Edita os dados do utilizador */
router.post("/editUser/:userId", authController.authenticateToken, typeUser.isAdmin, userController.updateUser);

/* Permite apagar um user */
router.post("/delete/:userId", authController.authenticateToken, typeUser.isAdmin, userController.deleteUser);

/*Desbanir um user manualmente */
router.post("/desban/:userId", authController.authenticateToken, typeUser.isAdmin, userController.desban);

/* Banir um utilizador */
router.post("/ban/:userId", authController.authenticateToken, typeUser.isAdmin, userController.ban);

module.exports = router;