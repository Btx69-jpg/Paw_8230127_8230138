const express = require("express");
const router = express.Router();

//Controllers
const carrinhoController = require("../Controllers/CarrinhoController");

/**
 * * Rota que carrega a pagina do carrinho de compras do utilizador
 * */
router.get('/', carrinhoController.carrinhoPage);
  
module.exports = router;