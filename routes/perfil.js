var express = require('express');
var router = express.Router();

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isAdmin } = require("../Middleware/TypeUserMiddleware.js");

//Routers 
const adminRouter = require("./perfilRoutes/admin.js") 

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * */
router.use(authenticateToken);

/**
 * * Importação do router do perfil do admin
 * */
router.use('/admin', isAdmin, adminRouter);

module.exports = router;