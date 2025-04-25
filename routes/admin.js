const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../Controllers/AdminController.js");

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../Middleware/TypeUserMiddleware.js");

//Routers
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");
const passwordController = require("../Controllers/PasswordController.js");
const portionsRouter = require("./adminRoutes/portions.js");

/**
 * * Rota que aplicar a todas as rotas deste js os suguintes middlewares
 * 
 * * authenticateToken --> valida se o token do utilizador é valido.
 * * isAdmin --> verifica se o utilizador autenticado é um Admin
 * */
router.use(authenticateToken, isAdmin);

/**
 * * Rota que carrega a pagina inicial de um admin
 * */
router.get("/", adminController.homePage);

/**
 * * Rota que renderiza a página de edição dos dados do admin
 * 
 * * adminId --> id do admin, cujo os dados vão ser editados.
 * */
router.get("/editDados/:adminId", adminController.editPage);

/**
 * * Rota que atualiza os dados de um admin
 * 
 * * accountId --> id do admin, cujo os dados serão atualizados
 * */
router.post("/updateAdmin/:accountId", adminController.updateAdmin);

/**
 * * Rota que renderiza a página, de alteração da password, da conta do admin
 * 
 * * accountId --> id do admin, cujo os dados serão atualizados
 * */
router.get("/editPassword/:accountId", passwordController.editPassword);

/**
 * * Rota que guarda a nova password do perfil do admin
 * 
 * * accountId --> id do admin, que a password foi atualizada
 * */
router.post("/changePassword/:accountId", passwordController.updatePassword);

/**
 * * Rota que permite dar delete há conta do admin
 * 
 * * adminId --> id do admin, que a conta foi eliminada
 */
router.post("/deleteAccount/:adminId", adminController.deleteAdm);

/**
 * * Importação do router com as rotas que permitem ao admin realizar o CRUD dos restaurantes 
 * */
router.use("/listRestaurants", restaurantRouter);

/**
 * * Importação do router com as rotas que permitem ao admin realizar o CRUD dos utilizadores do site 
 * */
router.use("/listUsers", userRouter);

/**
 * * Importação do router com as rotas que permitem ao admin realizar o CRUD das categorias 
 * */
router.use("/listCategories", categoriesRouter);

/**
 * * Importação do router com as rotas que permitem ao admin realizar o CRUD das porções 
 * */
router.use("/listPortions", portionsRouter);

module.exports = router;