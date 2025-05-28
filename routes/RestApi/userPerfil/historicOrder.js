const express = require("express");
const router = express.Router({ mergeParams: true });

//Controllers
const historicOrderController = require("../../../Controllers/ControllersPerfil/ControllersUser/HistoricOrderController")
const commentController = require("../../../Controllers/ControllersPerfil/ControllersUser/Comments.js");

const { uploadCreatePhoto } = require('../../../Middleware/PhotosComentMiddleware.js')
/**
 * * Rota que carrega todo o historico de encomendas de um utilizador
 * */
router.get("/", historicOrderController.gethistoricOrder);

/**
 * * Rota que carrega uma encomenda especifica no historico de encomendas
 * */
router.post("/createComment", uploadCreatePhoto.single('commentPhoto'), commentController.createComment);

/**
 * * Rota para atualizar um comentário
 */
router.put("/updateComment", uploadCreatePhoto.single('commentPhoto'), commentController.updateComment);

/**
 * * Rota que carrega todo o historico de encomendas de um utilizador
 * */
router.get("/search", historicOrderController.searchOrderHistoric);

/**
 * * Rota que carrega uma encomenda especifica no historico de encomendas
 * */
router.get("/:orderId", historicOrderController.showOrder);

/**
 * * Rota que permite apagar o comentario de uma encomenda
 * */
router.delete("/:orderId", commentController.deleteComment);
module.exports = router;