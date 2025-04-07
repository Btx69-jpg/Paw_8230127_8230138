const express = require("express");
const router = express.Router();

const adminController = require("../Controllers/AdminController.js");
const categoryController = require("../Controllers/CategoriesController.js");

//Pagina do admin
router.get("/", function(req, res) {
    adminController.homePage(req, res);
});

/*Routers para os restaurantes */
router.get("/listRestaurants", function(req, res) {
    adminController.listRestaurants(req, res);
});

/*Routers para os users */
router.get("/listUsers", function(req, res) {
    adminController.listUsers(req, res);
});

/*Routers para as categorias */
router.get("/listCategories", function(req, res) {
    adminController.listCategories(req, res);
});

router.post("/listCategories/deleteCateory/:CategoryId", function(req, res) {
    
})
module.exports = router;