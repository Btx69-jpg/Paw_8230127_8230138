const express = require("express");
const router = express.Router();
const loginController = require("../Controllers/LoginController.js");

// Página de login
router.get("/", loginController.login);

// Autenticação de utilizador
router.post("/", loginController.authenticate, (req, res) => {
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
