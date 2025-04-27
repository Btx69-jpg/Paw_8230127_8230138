var mongoose = require("mongoose");
var carrinhoController = {};

carrinhoController.carrinhoPage = function(req, res) {
    const cart = res.locals.user.cart || { items: [] };
    res.render('checkOut', { cart: cart });
}

module.exports = carrinhoController;