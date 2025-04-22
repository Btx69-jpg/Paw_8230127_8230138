var mongoose = require("mongoose");

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

//Metodos
const {carregarCategoriesMenus} = require("./Functions/categories.js");

var restaurantController = {};

restaurantController.homePage = async function(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
    const menus = restaurant.menus;
    const categories = await carregarCategoriesMenus(menus);
    res.render("restaurants/restaurant/homepage", { restaurant: restaurant, menus: menus, filters: {}, categories: categories });
  } catch (err) {
      res.status(500).render("errors/error", {numError: 500, error: err});
  }
};

/*
Terminar, só falta mandar o menu no render
*/
restaurantController.searchMenu = async function(req, res) {
  let query = {};
  const name = req.query.mameMenu;
  const numDish = req.query.numDish;
  const type = req.query.type;

  if (name) {
      query.name = name;
      console.log("Nome do menu: ", name);
  }

  if (type && type !== "all") {
    query.type = type;
  }
  
  console.log("Query: ", query);
  try {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
    let menus = [];

    if (restaurant) {
      /*
      O filter ele percorre todos os elementos do array, e para cada elemento chama a função callback
      Se o callback devolver true esse elemento é incluido no array, se retornar false é descartado.

      Object.entries --> converte a query numa lista de pares, [campo, valor], ex: [['name', 'HappyMeals'], ['type', 'carne']]
      .every --> metodo que retornar ture somente se todos os elementos do array, satisfazerem a condição do mesmo
      */
      menus = await restaurant.menus.filter(menu => {
        return Object.entries(query)
          .every(([field, value]) => {

           return menu[field] === value
        });
      });
    }

    const categories = await carregarCategoriesMenus(menus);
    console.log("Restaurante: ");
    res.render("restaurants/restaurant/homepage", { restaurant: restaurant, menus: menus, filters: {name, numDish, type}, categories: categories });
  } catch (err) {
      res.status(500).render("errors/error", {numError: 500, error: err});
  }
};

module.exports = restaurantController;