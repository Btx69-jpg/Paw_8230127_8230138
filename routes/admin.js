const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../Controllers/AdminController.js");
const authTokenMiddleware = require("../Middleware/AuthTokenMiddleware.js");
const typeUserMiddlewareMiddleware = require("../Middleware/TypeUserMiddleware.js");

//routes
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");

//Pagina do admin
router.get("/", authController.authTokenMiddleware, typeUserMiddleware.isAdmin, adminController.homePage);

//Route para eliminar o admin
router.post("/deleteAccount/:adminId", authController.authTokenMiddleware, typeUserMiddleware.isAdmin, adminController.deleteAdm);

/*Routers para os restaurantes */
router.use("/listRestaurants", authController.authTokenMiddleware, typeUserMiddleware.isAdmin, restaurantRouter);

/*Routers para os users */
router.use("/listUsers", authController.authTokenMiddleware, typeUserMiddleware.isAdmin, userRouter);

/*Routers para as categorias */
router.use("/listCategories", authController.authTokenMiddleware, typeUserMiddleware.isAdmin, categoriesRouter);

module.exports = router;