const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/ControllersPerfil/UserController.js")
const passwordController = require("../../Controllers/ControllersPerfil/PasswordController.js")

//Routes
const historicOrderRoute = require("./userPerfil/historicOrder.js");
const manageAddressesRoute = require("./userPerfil/address.js");

/**
 * !Só falta testar o Edit, mas testar apenas quando estiver o Mongo, pois é mais fácil.
 */
/**
 * * Rota que carrega os dados de todos os users
 */
router.get("/user", userController.getUsers);

/**
 * * Rota que carrega a pagina inicial de um admin
 * */
router.get("/user/:userId", userController.getUser);

/** 
 * * Rota que cria um novo utilizador
 * */
router.delete("/user/:userId", userController.deleteUser);

/**
 * * Rota para atualizar os dados do utilizador
 * */
router.put("/user/:userId", userController.editUser);

/**
 * * Rota que atualiza a password do utilizador
 */
router.put("/user/:userId/changePassword", passwordController.updatePassword);
/**
 * * Importação das rotas do historico de encomendas do utilizador
 */
router.use("/user/:userId/historicOrder", historicOrderRoute);

/**
 * * Importação das rotas para a gestão das moradas do utilizador
 */
router.use("/user/:userId/addresses", manageAddressesRoute);


module.exports = router;