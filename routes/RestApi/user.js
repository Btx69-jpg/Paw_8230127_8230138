const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/ControllersPerfil/userController.js")

//Routes
const historicOrderRoute = require("./userPerfil/historicOrder.js");

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
 * * Importação das rotas do historico de encomendas do utilizador
 */
router.use("/user/:userId/historicOrder", historicOrderRoute);
module.exports = router;