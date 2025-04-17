const express = require("express");
const router = express.Router();

const authTokenMiddleware = require("../../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../../Middleware/TypeUserMiddleware.js");
const portionsController = require("../../Controllers/ControllersAdmin/PortionController.js");
//Meter como na admin

/*Routers para as categorias */
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.homePage);

router.get("/createPortion", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.createPortion);

router.post("/savePortion", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.savePortion);

router.get("/editPortion/:portionId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.editPortion);

router.post("/updatPortion/:portionId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.updatPortion);

//Posso depois alterar para um delete
router.post("/deletetPortion/:portionId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsController.deletePortion);

module.exports = router;