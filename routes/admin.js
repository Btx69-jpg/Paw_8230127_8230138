const express = require("express");
const router = express.Router();

//Controlars
const adminController = require("../Controllers/AdminController.js");

//routes
const restaurantRouter = require("./adminRoutes/listrestaurants.js");
const userRouter = require("./adminRoutes/listusers.js");
const categoriesRouter = require("./adminRoutes/categories.js");

//Pagina do admin
router.get("/", adminController.homePage);

//Route para eliminar o admin
router.post("/deleteAccount/:adminId", adminController.deleteAdm);

/*Routers para os restaurantes */
router.use("/listRestaurants", restaurantRouter);

/*Routers para os users */
router.use("/listUsers", userRouter);

/*Routers para as categorias */
router.use("/listCategories", categoriesRouter);

module.exports = router;