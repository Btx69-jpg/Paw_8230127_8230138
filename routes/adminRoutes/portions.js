const express = require("express");
const router = express.Router();

//Controllers
const portionsController = require("../../Controllers/ControllersAdmin/PortionController.js");

/**
 * Rota que renderiza pagina com a lista das porções existentes 
 * */
router.get("/", portionsController.homePage);

/**
 * Rota que que permite filtrar e ordernar dados na pagina das categorias
 */
router.get("/search", portionsController.search);

router.get("/createPortion", portionsController.createPortion);

router.post("/savePortion", portionsController.savePortion);

router.get("/editPortion/:portionId", portionsController.editPortion);

router.post("/updatPortion/:portionId", portionsController.updatPortion);

router.post("/deletetPortion/:portionId", portionsController.deletePortion);

module.exports = router;