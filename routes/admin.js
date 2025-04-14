const express = require("express");
const router = express.Router();

//Controllers
const adminController = require("../Controllers/AdminController.js");
const authController = require("../Controllers/AuthController.js");
const typeUser = require("./functions/typeUser.js");

//routes
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");

//Pagina do admin
router.get("/", authController.authenticateToken, typeUser.isAdmin, adminController.homePage);

//Route para eliminar o admin
router.post("/deleteAccount/:adminId", authController.authenticateToken, typeUser.isAdmin, adminController.deleteAdm);

/*Routers para os restaurantes */
router.use("/listRestaurants", authController.authenticateToken, typeUser.isAdmin, restaurantRouter);

/*Routers para os users */
router.use("/listUsers", authController.authenticateToken, typeUser.isAdmin, userRouter);

/*Routers para as categorias */
router.use("/listCategories", authController.authenticateToken, typeUser.isAdmin, categoriesRouter);

module.exports = router;