var mongoose = require("mongoose");

var adminController = {};

adminController.homePage = async function(req, res) {
    res.render("perfil/admin/adminPage");
};

module.exports = adminController;