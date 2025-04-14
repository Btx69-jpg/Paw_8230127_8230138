const express = require("express");
const router = express.Router();

const authTokenMiddleware = require("../../Middleware/AuthTokenMiddleware.js");
const typeUserMiddleware = require("../../Middleware/TypeUserMiddleware.js");
const categoriesController = require("../../Controllers/ControllersAdmin/CategoriesController.js");
//Meter como na admin

/*Routers para as categorias */
router.get("/", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.homePage);

router.get("/createCategory", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.createCategory);

router.post("/saveCategory", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.saveCategory);

router.get("/editCategory/:categoryId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.editCategory);

router.post("/updatCategory/:categoryId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.updatCategory);

//Posso depois alterar para um delete
router.post("/deletetCategory/:categoryId", authTokenMiddleware.authenticateToken, typeUserMiddleware.isAdmin, categoriesController.deleteCategory);

module.exports = router;