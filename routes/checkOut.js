const express = require("express");
const router = express.Router();

//Controllers
const carrinhoController = require("../Controllers/CarrinhoController");
const userController = require("../Controllers/ControllersPerfil/UserController.js");

/**
 * * Rota que carrega a pagina do carrinho de compras do utilizador
 * */
router.get('/', carrinhoController.carrinhoPage);

/**
 * * Rota que Limpa o carrinho do utilizador
 * */
router.get('/limparCarrinho', userController.cleanCart);
  
module.exports = router;