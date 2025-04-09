const express = require("express");
const router = express.Router();

const adminController = require("../Controllers/AdminController.js");
const categoriesController = require("../Controllers/ControllersAdmin/CategoriesController.js");
const userController = require("../Controllers/ControllersAdmin/UsersController.js");
const restaurantController = require("../Controllers/ControllersAdmin/RestaurantController.js")

//Pagina do admin
router.get("/", function(req, res) {
    adminController.homePage(req, res);
});

/*Routers para os restaurantes */
router.get("/listRestaurants", function(req, res) {
    restaurantController.homePage(req, res);
});

/*Routers para os users */
router.get("/listUsers", function(req, res) {
    userController.homePage(req, res);
});

/*Desbanir um user manualmente */
router.post("/listUsers/desban/:userId", function(req, res) {
    userController.desban(req, res);
});

/*Routers para as categorias */
router.get("/listCategories", function(req, res) {
    categoriesController.homePage(req, res);
});

router.get("/listCategories/createCategory", function(req, res) {
    categoriesController.createCategory(req, res);
});

router.post("/listCategories/saveCategory", function(req, res) {
    categoriesController.saveCategory(req, res);
});

router.get("/listCategories/editCategory/:categoryId", function(req, res) {
    categoriesController.editCategory(req, res);
});

router.post("/listCategories/updatCategory/:categoryId", function(req, res) {
    categoriesController.updatCategory(req, res);
});

router.post("/listCategories/deletetCategory/:categoryId", function(req, res) {
    categoriesController.deleteCategory(req, res);
});

module.exports = router;