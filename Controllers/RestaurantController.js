var mongoose = require("mongoose");
const multer  = require('multer');

const Restaurant = require("../Models/Perfils/Restaurant");
const Dish = require("../Models/Menus/Dish");
const Category = require("../Models/Reusable/Category");
const Menu = require("../Models/Menus/Menu")
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
        res.render("errors/error500", {error: "Problema a procurar as categorias dos pratos"});
    }
}

//Testar
async function renderEditDish(res, dish) {
    let categories = await carregarCategories();

    if(categories != null) {
        res.render("restaurants/restaurant/Dishs/editDish", {dish: dish}, {categories: categories});
    } else {
        res.render("errors/error500", {error: "Problema a procurar os pratos"});
    }
}

restaurantController.homePage = async function(req, res) {
    //Copiar o veiw da ficha6, para mostar apenas 1 restaurante e mandar no render
    //Depois meter res.redirect("/employees/show/" + employee._id);
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        let categories = await carregarCategories();
        res.render("restaurants/restaurant/homepage", { restaurant: restaurant, categories: categories });
    } catch (err) {
        res.render("errors/error500", {error: err});
    }
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
        res.render("restaurants/restaurant//menu", {dishs: dishs});
      }).catch(function(err) {
        res.render("errors/error500", {error: err});
      });
    
};

//Permite criar um novo menu no restaurante
restaurantController.createMenu = async function (req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const categories = await carregarCategories();

        res.render("restaurants/restaurant/Menu/createMenu", { restaurant: restaurant, categories: categories });
    } catch (err) {
        res.render("errors/error500", {error: err});
    }
};
restaurantController.saveMenu = async function(req, res) {
    try {
      
      let restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
      if (!restaurant) {
        return res.status(404).send("Restaurante não encontrado");
      }
  
      console.log(req.body);
      // Importante: Considere usar o nome correto do campo para o tipo do menu.
      // No formulário, o campo é "type", não "menuType"
      let menuType = req.body.type;
      // Recupera os pratos enviados no formulário
      let dishes = req.body.dishes;
      // Verifica se foram enviados pratos
      if (!dishes) {
        return res.status(400).send("Nenhum prato foi enviado");
      }
      
      // Se houver apenas um prato, o body-parser pode não criar um array,
      // então garantimos que 'dishes' seja sempre um array.
      if (!Array.isArray(dishes)) {
        dishes = [dishes];
      }
      
      // Cria instâncias do modelo Dish para cada prato recebido
      // (Caso deseje salvá-los individualmente no banco, poderá chamar dish.save())
      let dishObjects = [];
      for (let i = 0; i < dishes.length; i++) {
        const dishData = dishes[i];

        console.log(dishData);
        let dishObj = new Dish({
          name: dishData.name,
          description: dishData.description,
          category: dishData.category,
          price: dishData.price,
          // photo: caminho (se houver o upload da foto configurado)
        });

        dishObjects.push(dishObj);
      }
      
      // Cria uma nova instância do menu
      const menu = new Menu({
        name: req.body.name,
        type: menuType, // Agora vem do req.body.type
        dishes: dishObjects,
      });
  

      // Adiciona o menu ao restaurante encontrado
      console.log(menu);
      restaurant.menus.push(menu);
  
      console.log(restaurant);
      //Erro no await restuarante.save()
      // Salva o restaurante com o novo menu
      await restaurant.save();
  
      console.log("Menu guardado com sucesso no restaurante");
      res.redirect("/restaurants/" + restaurant.name);
    } catch (err) {
      res.render("errors/error500", {error: err})
    }
};
//Permite com detalhes o prato especifico de um menu
restaurantController.showDish = function(req, res) {
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
        res.redirect("/restaurants/restaurant/menu/");
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