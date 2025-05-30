const express = require("express");
const router = express.Router();

//Controllers
const userController = require("../../Controllers/ControllersPerfil/UserController.js")
const passwordController = require("../../Controllers/ControllersPerfil/PasswordController.js")
const uploadUpdatePhoto = require('../../Middleware/UploadUserImgMiddleware.js');

//Routes
const historicOrderRoute = require("./userPerfil/historicOrder.js");
const manageAddressesRoute = require("./userPerfil/address.js");
const orderRoute = require("./userPerfil/orders.js");

/**
 * * Rota que carrega os dados de todos os users
 */
router.get("/", userController.getUsers);

/**
 * * Importação das rotas do historico de encomendas do utilizador
 */
router.use("/:userId/historicOrder", historicOrderRoute);

/**
 * * Importação das rotas do historico de encomendas do utilizador
 */
router.use("/:userId/orders", orderRoute);
/**
 * * Importação das rotas para a gestão das moradas do utilizador
 */
router.use("/:userId/addresses", manageAddressesRoute);

/**
 * * Rota que carrega a pagina inicial de um admin
 * */
router.get("/:userId", userController.getUser);

/**
 * * Rota que devolve se o utilizador está ou não banido de realizar ou cancelar encomendas
 */
router.get("/:userId/isBanOrder", userController.isUserBannedOrders);

/** 
 * * Rota que elimina um utilizador
 * */
router.delete("/:userId", userController.deleteUser);

/**
 * * Rota para enviada os dados do utilizador, que podem ser atualizados pelo mesmo
 * */
router.get("/:userId/editData", userController.getUserEdit);

/**
 * * Rota para atualizar os dados do utilizador
 * */
router.put("/:userId", uploadUpdatePhoto.single('perfilPhoto'), userController.editUser);

/**
 * * Rota que atualiza a password do utilizador
 */
router.put("/:userId/changePassword", passwordController.updatePassword);

module.exports = router;