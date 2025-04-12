const express = require("express");
const router = express.Router();

const userController = require("../../Controllers/ControllersAdmin/UsersController.js");

/*Routers para os users */
router.get("/", userController.homePage);

/* Carrega a pagina de criação do utilizador */
router.get("/createUser", userController.createUser);

/* Guarda um novo utilizador na BD */
router.post("/createUser", userController.saveUser);

/* Carrega a pagina de criação do utilizador */
router.get("/editUser/:userId", userController.editPage);

router.post("/editUser/:userId", userController.updateUser);

/* Permite apagar um user */
router.post("/delete/:userId",userController.deleteUser);

//Depois trocar este dois para um put
/*Desbanir um user manualmente */
router.post("/desban/:userId", userController.desban);

/* Banir um utilizador */
router.post("/ban/:userId", userController.ban);

module.exports = router;