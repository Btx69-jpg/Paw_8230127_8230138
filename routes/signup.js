var express = require('express');
var router = express.Router();

const signUpController = require("../Controllers/SignUpController.js");
const {possibleBlockLogin} = require("../Middleware/ValidateLoginMiddleware.js");

router.use(possibleBlockLogin)

// Página de registo
router.get("/", signUpController.signup);

// Registo de utilizador
router.post("/", signUpController.save);

module.exports = router;