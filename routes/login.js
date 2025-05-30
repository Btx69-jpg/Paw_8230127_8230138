const express = require("express");
const router = express.Router();

//Controllers
const loginController = require("../Controllers/LoginController.js");
const passwordController = require("../Controllers/PasswordController.js");

//Middlewares
const {possibleBlockLogin} = require("../Middleware/ValidateLoginMiddleware.js");

/**
 * * Rota que permite ao utilizador fazer logout da sua sessão
 * */
router.get("/logOut", loginController.logout);

/**
 * * Aquila o middleware para block, nas rotas abaixo
 * 
 * * possibleBlockLogin --> caso o utilizador já esteja autenticado, impedio de aceder as rotas de login
 * */
//router.use(possibleBlockLogin);

/**
 * * Rota que carrega a página de login
 * */
router.get("/", loginController.login);

/**
 * * Rota que realiza o login do utilizador e atribui-lhe um token de autentificação
 * */
router.post("/", loginController.loginToken);

/**
 * * Rota que realiza o login do utilizador pela google e atribui-lhe um token de autentificação
 * */
router.post("/auth/Google", loginController.loginToken);

router.post('/forgot-password', loginController.forgotPassword);

// Rota para renderizar a página de alteração de senha via link do email
router.get('/changePassword', (req, res) => {
  const { userId, token } = req.query;
  res.render('login/changePassword', { userId, token });
});

/**
 * Rota pública para reset de senha por token (NÃO requer autenticação)
 */
router.post("/perfil/user/:userId/reset-password", passwordController.resetPasswordByToken);

module.exports = router;
