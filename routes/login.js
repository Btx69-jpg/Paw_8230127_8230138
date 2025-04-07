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

router.get("/logOut", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Erro ao fazer logout.");
        }
        req.flash("success_msg", "Logout realizado com sucesso!");
        res.redirect("/");
    });
});

module.exports = router;
