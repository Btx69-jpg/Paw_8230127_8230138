const express = require("express");
const router = express.Router();
const userController = require("../Controllers/LoginController.js");

// Página de login
router.get("/login", userController.login);

// Página de registo
router.get("/signUp", userController.signup);

// Registo de utilizador
router.post("/signUp", userController.save);

// Autenticação de utilizador
router.post("/login", userController.authenticate, (req, res) => {
    req.flash("success_msg", "Login realizado com sucesso!");
    res.redirect("/");
});

module.exports = router;
