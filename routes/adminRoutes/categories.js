const express = require("express");
const router = express.Router();

const categoriesController = require("../../Controllers/ControllersAdmin/CategoriesController.js");
//Meter como na admin

/*Routers para as categorias */
router.get("/", function(req, res) {
    categoriesController.homePage(req, res);
});

router.get("/createCategory", function(req, res) {
    categoriesController.createCategory(req, res);
});

router.post("/saveCategory", function(req, res) {
    categoriesController.saveCategory(req, res);
});

router.get("/editCategory/:categoryId", function(req, res) {
    categoriesController.editCategory(req, res);
});

router.post("/updatCategory/:categoryId", function(req, res) {
    categoriesController.updatCategory(req, res);
});

//Posso depois alterar para um delete
router.post("/deletetCategory/:categoryId", function(req, res) {
    categoriesController.deleteCategory(req, res);
});

module.exports = router;