const express = require("express");
const router = express.Router();
const userController = require("../Controllers/LoginController.js");

// Página de login
router.get("/login", userController.login);

// Página de registo
router.get("/signUp", userController.signup);

// Registo de utilizador
router.post("/signUp", userController.save);

module.exports = router;
