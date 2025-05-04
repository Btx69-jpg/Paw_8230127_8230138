const express = require("express");
const router = express.Router();

//Controllers
const manageController = require("../../../Controllers/ControllersPerfil/ControllersUser/AddressController.js");

/**
 * TODO: Terminar o codigo do controller deste utilizador
 */

/**
 * * Rota que carrega a pagina de perfil do utilizador
 */
router.get("/", manageController.manageAddress);

/**
 * * Rota que permite pesquisar uma morada
 */
router.get("/search", manageController.searchAddress);

/**
 * * Rota que permite criar uma morada
 */
router.get("/createAddress", manageController.createAddress);

/**
 * * Rota que permite guaradar uma nova morada
 */
router.post("/saveAddress", manageController.saveAddress);

/**
 * * Rota que permite editar uma morada
 */
router.get("/editAddress", manageController.editAddress);

/**
 * * Rota que permite atualizar uma nova morada
 */
router.post("/updateAddress", manageController.updateAddress);

/**
 * * Rota que permite eliminar nova morada
 */
router.post("/deleteAddress", manageController.deleteAddress);
module.exports = router;