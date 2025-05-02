const express = require("express");
const router = express.Router();

//Controllers
const portionsController = require("../../../Controllers/ControllersAdmin/PortionController.js");

/**
 * * Rota que renderiza pagina com a lista das porções existentes 
 * */
router.get("/", portionsController.homePage);

/**
 * * Rota que que permite filtrar e ordernar dados na pagina das categorias
 * */
router.get("/search", portionsController.search);

/**
 * * Rota que carrega a página para criação de uma porção
 * */
router.get("/createPortion", portionsController.createPortion);

/**
 * * Rota que permite guardar uma nova porção
 * */
router.post("/savePortion", portionsController.savePortion);

/**
 * * Rota que carrega a página para edição de uma porção
 * 
 * * portionId --> Id da porção a ser editada
 * */
router.get("/editPortion/:portionId", portionsController.editPortion);

/**
 * * Rota que atualiza os dados de uma porção, já existente
 * 
 * * portionId --> Id da porção a ser atualizada
 * */
router.post("/updatPortion/:portionId", portionsController.updatPortion);

/**
 * * Rota que elimina uma porção
 * 
 * * portionId --> Id da porção a ser eliminada
 * */
router.post("/deletetPortion/:portionId", portionsController.deletePortion);

module.exports = router;