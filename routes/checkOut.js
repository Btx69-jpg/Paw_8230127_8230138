const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    const cart = res.locals.user.cart || { items: [] }; // Garante que cart tem a estrutura esperada
    res.render('checkout', { cart: cart });
  });
  
module.exports = router;