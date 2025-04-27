var mongoose = require("mongoose");
var indexController = {};

indexController.indexPage = function(req, res) {
    res.render('index');
}

module.exports = indexController;