const mongoose = require("mongoose");
const passport = require('passport');

const loginController = {};

// Renderiza página de login
loginController.login = (req, res) => {
    res.render("login/login");
};

// Autentica o utilizador
loginController.authenticate = (req, res, next) => {
    console.log("Autenticando utilizador...");
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })(req, res, next);
};

module.exports = loginController;
