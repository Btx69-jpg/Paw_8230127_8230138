var mongoose = require("mongoose");

var dishController = {};

//Models
const Dish = require("../../Models/Menus/Dish");

//metodos
const {carregarCategories} = require("../Functions/categories.js");
const {carregarPortions} = require("../Functions/portions.js");

async function renderCreateDish(res) {
    let categories = await carregarCategories();
    let portions = await carregarPortions();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/createDish", {categories: categorie, portions: portions});
    } else {
        res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar as categorias dos pratos"});
    }
}

async function renderEditDish(res, dish) {
    let categories = await carregarCategories();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/editDish", {dish: dish}, {categories: categories});
    } else {
        res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar os pratos"});
    }
}

//Permite com detalhes o prato especifico de um menu
dishController.showDish = function(req, res) {
    Dish.findOne({_id: req.params.id}).exec(function (err, dish) {
        if(err) {
            console.log("Erro: ", err);
            res.redirect(res.locals.previousPage);
        } else {
            res.render("restaurants/restaurant/Dishs/showDish", {dish: dish});
        }
    });
};

//Renderiza a pagina para a criação das dishs
dishController.createDish = function(req, res) {
    renderCreateDish(res);
};

dishController.saveDish = function(req, res) {
    let dish = new Dish({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        photo: caminho
    });
    

    dish.save(function(err) {
        if(err) {
            console.log(err);
            renderCreateDish(res);
        } else {
            console.log("Prato guardado com sucesso");
            res.redirect("/restaurants/restaurant/menu/showDish/" + dish._id);
        }
    })
}

//Reencaminha para a pagina de edita
dishController.editDish = function(req, res) {
    let dish = null;
    try {
        dish = Dish.findOne({_id: req.params.id}).exec();
        renderEditDish(res, dish);
    } catch (err) {
        console.log("Erro ao procurar a dish: ", err);
        res.redirect("/restaurants/restaurant/menu/");
    }
};

//Atualiza uma dish existente
dishController.updateDish = function(req, res) {

};

//Apaga uma dish existente (Aqui falta apagar para o restaurante especifico)
dishController.deleteDish = function(req, res) {
    Dish.remove({_id: req.params.id}, function(err) {
        if(err) {
            console.log("Ocorreu um problema a eliminar o prato");
            res.render("/restaurants/restaurant/menu")
        } else {
            console.log("Prato eliminado com sucesso");
            res.redirect("/restaurants/restaurant/menu/")
        }
    })
};


module.exports = dishController;