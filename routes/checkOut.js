const express = require("express");
const router = express.Router();

//Controllers

const userController = require("../Controllers/ControllersPerfil/UserController.js");

/**
 * * Rota que Limpa o carrinho do utilizador
 * */
router.get('/limparCarrinho', userController.cleanCart);
  
module.exports = router;