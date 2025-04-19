var mongoose = require("mongoose");

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

//Metodos
const {carregarCategories} = require("./Functions/categories.js");
const {carregarPortions} = require("./Functions/portions.js");

var restaurantController = {};

//Depois quando os restuarant e menu estiverem todos vem, modeificar os links todos
restaurantController.homePage = async function(req, res) {
    console.log("Nome do restaurante: ", req.params.restaurant);
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        let categories = await carregarCategories();
        res.render("restaurants/restaurant/homepage", { restaurant: restaurant, categories: categories });
    } catch (err) {
        res.render("errors/error", {numError: 500, error: err});
    }
};


//Codigo que guarda uma dish
/*
Depois meter o resto do codigo, para associar a dish a um menu especifico de um restaurante especifico
Meter depois verificações a ver se esta Dish já não existie
*/ 

/* SE DEIXAR DE DAR, DESCOMENTAR O CODIGO A BAIXO
// Configurando o storage para salvar as fotos dos pratos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Cria um caminho para armazenar as imagens: 
      // "public/images/Restaurants/<nomeRestaurant>/Menus/<nomeMenu>/"
      const pathFolder = "public/images/Restaurants/" + req.params.restaurant + "/Menus/" + req.body.menuName + "/";
      try {
        fs.mkdirSync(pathFolder, { recursive: true });
        console.log('Pasta criada com sucesso!');
      } catch (err) {
        console.error('Erro ao criar a pasta:', err);
      }
      cb(null, pathFolder);
    },
    filename: function (req, file, cb) {
      // Prefixo com timestamp para evitar nomes duplicados
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Cria o upload middleware que aceita qualquer arquivo
  const upload = multer({ storage: storage }).any();
*/
module.exports = restaurantController;