const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/ControllersPerfil/UserController.js");
const perfilController = require("../../Controllers/PerfilController.js");
const passwordController = require("../../Controllers/PasswordController.js");

//Middlewares
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isDonoOrCliente} = require("../../Middleware/TypeUserMiddleware.js");

//Routes 
const manageAddress = require("./userRoutes/address.js");
const historicOrder = require("./userRoutes/historicOrder.js");

/**
 * TODO: Terminar o codigo do controller deste utilizador
 */

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * * isAdmin --> verifica se o utilizador autenticado é um Admin
 * */
router.use(authenticateToken, isDonoOrCliente);

/**
 * * Rota que carrega a pagina de perfil do utilizador
 */
router.get("/", userController.getUser);

/**
 * * Rota que carrega a pagina de edição dos dados do utilizador
 */
router.get("/editDados", userController.editPage);

/**
 * * Rota que atualiza os dados do utilizador
 */
router.post("/updateUser", userController.updateUser);

/**
 * * Rota que carrega a página para editar a password
 */
router.get("/editPassword", passwordController.editPassword);

/**
 * * Rota que atualiza a password do utilizador
 * */
router.post("/changePassword", passwordController.updatePassword);

/**
 * * Rota que renderiza a página com a lista de pedidos do utilizador
 */
router.use("/historicOrder", historicOrder);

/**
 * * Rota que carrega a página com as moradas 
 */
router.use("/manageAddress", manageAddress);

/**
 * * Apaga a conta do utilizador
 */
router.post("/deleteAccount", perfilController.deleteAccount);

module.exports = router;