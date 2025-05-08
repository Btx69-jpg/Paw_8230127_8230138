/**
 * const express = require("express");
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

router.use(authenticateToken, isDonoOrCliente);


router.get("/", userController.getUser);


router.get("/editDados", userController.editPage);


router.post("/updateUser", userController.updateUser);


router.get("/editPassword", passwordController.editPassword);


router.post("/changePassword", passwordController.updatePassword);


router.use("/historicOrder", historicOrder);


router.use("/manageAddress", manageAddress);


router.post("/deleteAccount", perfilController.deleteAccount);

module.exports = router;
 * 
*/