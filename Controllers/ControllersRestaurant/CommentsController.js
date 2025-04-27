var mongoose = require("mongoose");

var commentController = {};

//metodo para renderizar a pagina dos comentarios
commentController.homePage = function(req, res) {
    res.render("restaurants/restaurant/comments");
};

module.exports = commentController;