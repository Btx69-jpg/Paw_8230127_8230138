var mongoose = require("mongoose");
const multer  = require('multer');

var Restaurant = require("../Models/Perfils/Restaurant");
var Dish = require("../Models/Menus/Dish");
var Category = require("../Models/Reusable/Category");

var storage;
var upload;

var restaurantController = {};

//Depois quando os restuarant e menu estiverem todos vem, modeificar os links todos

/*Funçõers responsaveis por carregar todas as categorias de pratos e renderizar no createDish e no editDish */
async function carregarCategories() {
    let categories = []
    try {
        categories = await Category.find({}).exec();
    } catch (err) {
        console.error(err);
        categories = null;
    }
    return categories;
}

async function renderCreateDish(res) {
    let categories = await carregarCategories();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/createDish", {categories: categories});
    } else {
        res.status(500).send("Problema a procurar as categorias dos pratos")
    }
}

//Testar
async function renderEditDish(res, dish) {
    let categories = await carregarCategories();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/editDish", {dish: dish}, {categories: categories});
    } else {
        res.status(500).send("Problema a procurar as categorias dos pratos")
    }
}

restaurantController.homePage = function(req, res) {
    //Copiar o veiw da ficha6, para mostar apenas 1 restaurante e mandar no render
    //Depois meter res.redirect("/employees/show/" + employee._id);
    res.render("restaurants/restaurant/homepage");
};

//Permite visualizar um menu especifico de um restaurante
restaurantController.comments = function(req, res) {
    res.render("restaurants/restaurant/comments");
};

//Permite visualizar um menu especifico de um restaurante
restaurantController.showMenu = function(req, res) {
    /*Depois mudar este find, para mostar os pratos de um determinado menu,
    por enquanto está assim para testar apenas os dishs */

    //Aqui seria apenas para carregar os pratos do menu e não todos os pratos criados
    Dish.find({}).exec().then(function(dishs) {
        res.render("restaurants/restaurant/menu", {dishs: dishs});
      }).catch(function(err) {
        console.log("Error", err);
        res.status(500).send("Problema a procurar pelos pratos do menu");
      });
    
};

//Permite criar um novo menu no restaurante
restaurantController.createMenu = function(req, res) {
    res.render("restaurants/restaurant/createMenu");
};

//Permite com detalhes o prato especifico de um menu
restaurantController.showDish = function(req, res) {
    Dish.findOne({_id: req.params.id}).exec(function (err, dish) {
        if(err) {
            console.log("Erro: ", err);
        } else {
            res.render("restaurants/restaurant/Dishs/showDish", {dish: dish});
        }
    });
};

//Renderiza a pagina para a criação das dishs
restaurantController.createDish = function(req, res) {
    //Carrego todas as categorias existentes e mando para o createDish
    renderCreateDish(res);
};

//Codigo que guarda uma dish
/*
Depois meter o resto do codigo, para associar a dish a um menu especifico de um restaurante especifico
Meter depois verificações a ver se esta Dish já não existie
*/ 

/*
Falta guaradar a imagem no public e guardar o caminho no mongo
*/
restaurantController.saveDish = function(req, res) {
    
    /*
        storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/images/')
            },
            filename: function (req, file, cb) {
                cb(null, `${Date.now()}-${file.originalname}`)
            }
        });

        let pathImage = req.file?.path || '';
        const caminho = pathImage.replace(/^public[\\/]/, "");
    */
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
restaurantController.editDish = function(req, res) {
    let dish = null;
    try {
        dish = Dish.findOne({_id: req.params.id}).exec();
        renderEditDish(res, dish);
    } catch (err) {
        console.log("Erro ao procurar a dish: ", err);
        res.redirect("/restaurants/restaurant/menu/")
    }
};

//Atualiza uma dish existente
restaurantController.updateDish = function(req, res) {

};

//Apaga uma dish existente (Aqui falta apagar para o restaurante especifico)
restaurantController.deleteDish = function(req, res) {
    Dish.remove({_id: req.params.id}, function(err) {
        if(err) {
            console.log("Ocorreu um problema a eleiminar o prato");
            res.render("/restaurants/restaurant/menu")
        } else {
            console.log("Prato eliminado com sucesso");
            res.redirect("/restaurants/restaurant/menu/")
        }
    })
};

module.exports = restaurantController;