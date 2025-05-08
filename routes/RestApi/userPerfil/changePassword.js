const express = require("express");
const router = express.Router({ mergeParams: true });

//Controllers
const passwordController = require("../../../Controllers/ControllersPerfil/PasswordController.js");

/**
 * TODO: TTestar as rotas e terminar os controllers do edit e remover.
 */

/**
 * * Rota que carrega a pagina de perfil do utilizador
 */
router.get("/", passwordController.getPassword);

/**
 * * Rota que atualiza a password do utilizador
 */
router.put("/", passwordController.updatePassword);

module.exports = router;