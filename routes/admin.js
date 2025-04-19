const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../Controllers/AdminController.js");

//Middlewares
const {authenticateToken} = require("../Middleware/AuthTokenMiddleware.js");
const {isAdmin} = require("../Middleware/TypeUserMiddleware.js");

//routes
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");
const passwordController = require("../Controllers/PasswordController.js");
const portionsRouter = require("./adminRoutes/portions.js");

//Rota que atribui as restantes a validação do token e verficia se o user é Admin
router.use(authenticateToken, isAdmin);

//Pagina do admin
router.get("/", adminController.homePage);

//Renderiza a pagina de edit do admin
router.get("/editDados/:adminId", adminController.editPage);

//Atualizar dados
router.post("/updateAdmin/:accountId", adminController.updateAdmin);

//Renderizar pagina para alterar a password
router.get("/editPassword/:accountId", passwordController.editPassword);

//Atualiza a password do admin
router.post("/changePassword/:accountId", passwordController.updatePassword);

//Route para eliminar o admin
router.post("/deleteAccount/:adminId", adminController.deleteAdm);

/*Routers para os restaurantes */
router.use("/listRestaurants", restaurantRouter);

/*Routers para os users */
router.use("/listUsers", userRouter);

/*Routers para as categorias */
router.use("/listCategories", categoriesRouter);

/**Router para as porçoes */
router.use("/listPortions", portionsRouter);

module.exports = router;