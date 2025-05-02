var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");


var userController = {};

userController.getUser = function(req, res) {
    const userId = req.params.userId;
    User.findById(userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: "Internal server error" });
        });
}

module.exports = userController;