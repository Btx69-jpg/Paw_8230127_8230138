const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/UserContro.js");

//Middlewares
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isDonoOrCliente} = require("../../Middleware/TypeUserMiddleware.js");

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * * isAdmin --> verifica se o utilizador autenticado é um Admin
 * */
router.use(authenticateToken, isDonoOrCliente);

router.get("/getUser/:userId", userController.getUser);

module.exports = router;