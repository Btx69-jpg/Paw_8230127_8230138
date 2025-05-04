const express = require("express");
const router = express.Router();

//Controllers
const historicOrderController = require("../../../Controllers/ControllersPerfil/ControllersUser/HistoricOrderController.js");

/**
 * TODO: Terminar o codigo do controller deste utilizador
 */

/**
 * * Rota que carrega a pagina de perfil do utilizador
 */
router.get("/", historicOrderController.historicOrder);

/**
 * * Rota que permite pesquisar uma morada
 */
router.get("/search", historicOrderController.searchOrder);

/**
 * * Rota que permite criar uma morada
 */
router.get("/showOrder", historicOrderController.showOrder);

module.exports = router;