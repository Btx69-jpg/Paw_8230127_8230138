const express = require("express");
const router = express.Router({ mergeParams: true });

//Controllers
const historicOrderController = require("../../../Controllers/ControllersPerfil/ControllersUser/HistoricOrderController")
const commentController = require("../../../Controllers/ControllersPerfil/ControllersUser/Comments.js");

const { createPhoto } = require('../../../Middleware/PhotosComentMiddleware.js')
/**
 * * Rota que carrega todo o historico de encomendas de um utilizador
 * */
router.get("/", historicOrderController.gethistoricOrder);

/**
 * * Rota que carrega uma encomenda especifica no historico de encomendas
 * */
router.post("/createComment", createPhoto.single('commentPhoto'), commentController.createComment);

/**
 * * Rota que carrega todo o historico de encomendas de um utilizador
 * */
router.get("/search", historicOrderController.searchOrderHistoric);

/**
 * * Rota que carrega uma encomenda especifica no historico de encomendas
 * */
router.get("/:orderId", historicOrderController.showOrder);

module.exports = router;