var mongoose = require("mongoose");

var commentController = {};

commentController.homePage = function(req, res) {
    res.render("restaurants/restaurant/comments");
};

module.exports = commentController;