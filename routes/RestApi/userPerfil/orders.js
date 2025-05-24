const express = require("express");
const router = express.Router({ mergeParams: true });

//Controllers
const orderController = require("../../../Controllers/ControllersPerfil/ControllersUser/Order");

/**
 * * Rota que carrega todas as encomendas em andamento do utilizador
 * */
router.get("/", orderController.getOrders);

/**
 * * Mostrar dados de uma encomenda especifica
 */
router.get("/:orderId", orderController.getOrder);

/**
 * Cancelar uma encomenda especifica 
 */
router.delete("/:orderId", orderController.cancelOrder);
module.exports = router;