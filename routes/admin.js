const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../Controllers/AdminController.js");

//Middlewares
const authTokenMiddleware = require("../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../Middleware/TypeUserMiddleware.js");

//routes
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");
const passwordController = require("../Controllers/PasswordController.js");
const portionsRouter = require("./adminRoutes/portions.js");


//Pagina do admin
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, adminController.homePage);

//Renderiza a pagina de edit do admin
router.get("/editDados/:adminId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, adminController.editPage);

//Atualizar dados
router.post("/updateAdmin/:adminId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, adminController.updateAdmin);

//Renderizar pagina para alterar a password
router.get("/editPassword/:accountId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, passwordController.editPassword);

//Atualiza a password do admin
router.post("/changePassword/:accountId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, passwordController.updatePassword);

//Route para eliminar o admin
router.post("/deleteAccount/:adminId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, adminController.deleteAdm);

/*Routers para os restaurantes */
router.use("/listRestaurants", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, restaurantRouter);

/*Routers para os users */
router.use("/listUsers", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, userRouter);

/*Routers para as categorias */
router.use("/listCategories", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesRouter);

/**Router para as porçoes */
router.use("/listPortions", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, portionsRouter);

module.exports = router;