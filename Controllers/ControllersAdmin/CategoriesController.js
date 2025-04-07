var mongoose = require("mongoose");

var Category = require("../../Models/Reusable/Category");
var categoriesController = {};

categoriesController.homePage = async function(req, res) {
    Category.find({}).exec()
        .then(function(categories) {
            res.render("perfil/admin/PagesAdmin/Categories/listCategories", {categories: categories});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).send("Problema a procurar pelos Restaurantes");
        });  
};

categoriesController.createCategory = async function(req, res) {
    res.render('perfil/admin/PagesAdmin/Categories/createCategories');
}

categoriesController.saveCategory = async function(req, res) {
    
}

categoriesController.editCategory = async function(req, res) {
    
}

categoriesController.updatCategory = async function(req, res) {
    
}

categoriesController.deleteCategory = async function(req, res) {
    try {
        await Category.deleteOne({ _id: req.params.categoryId });
        console.log("Categoria eliminada!");
        res.redirect("/admin/listCategories");
    } catch (error) {
        console.log("Error", error);
        res.status(500).send("Problema a apagar o restaurante");
    }
}

module.exports = categoriesController;