const express = require("express");
const router = express.Router();

const authController = require("../../Controllers/AuthController.js");
const typeUser = require("../functions/typeUser.js");
const categoriesController = require("../../Controllers/ControllersAdmin/CategoriesController.js");
//Meter como na admin

/*Routers para as categorias */
router.get("/", authController.authenticateToken, typeUser.isAdmin, categoriesController.homePage);

router.get("/createCategory", authController.authenticateToken, typeUser.isAdmin, categoriesController.createCategory);

router.post("/saveCategory", authController.authenticateToken, typeUser.isAdmin, categoriesController.saveCategory);

router.get("/editCategory/:categoryId", authController.authenticateToken, typeUser.isAdmin, categoriesController.editCategory);

router.post("/updatCategory/:categoryId", authController.authenticateToken, typeUser.isAdmin, categoriesController.updatCategory);

//Posso depois alterar para um delete
router.post("/deletetCategory/:categoryId", authController.authenticateToken, typeUser.isAdmin, categoriesController.deleteCategory);

module.exports = router;