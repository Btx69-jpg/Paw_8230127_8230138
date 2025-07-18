var mongoose = require("mongoose");

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

//Metodos
const { carregarCategoriesMenus } = require("./Functions/categories.js");

var restaurantController = {};

restaurantController.homePage = async function (req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();

    if(!restaurant) {
      console.log("Restaurante não encontrado");
      return res.status(404).redirect(res.locals);
    }

    const menus = restaurant.menus;
    const categories = await carregarCategoriesMenus(menus);
    let autEdit = false;
    let autGest = false;

    if (req.cookies && req.cookies.priority) {
      const priority = req.cookies.priority;

      if (priority === "Admin") {
        autEdit = true;
      } else if (priority === "Dono") {
        let found = false;
        let i = 0;
        let restIds = res.locals.user.perfil.restaurantIds;
        while (i < restIds.length && !found) {
          if(restIds[i].toString() === restaurant._id.toString()) {
            found = true;
          }
          i++;
        }

        if (found) {
          autEdit = true;
          autGest = true;
        }
      } else if (priority === "Restaurant" && restaurant._id.toString() === res.locals.user._id.toString()) {
        autGest = true;
      }
      res.locals.autEdit = autEdit;
      res.locals.autGest = autGest;

    }

    //Codigo para o google maps
    const fullAddress = `${restaurant.address.street}, ${restaurant.address.postal_code} ${restaurant.address.city}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const googleMapsUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

    const historicOrder = restaurant.perfil.historicOrders;

    let i = historicOrder.length - 1;
    const maxComments = 3;
    let countComment = 0;
    let comments = [];
    while (i >= 0 && countComment < maxComments) {
      const order = historicOrder[i];
      if (order.comment) {
        comments.push(order);
        countComment++;
      }

      i--;
    }

    res.render("restaurants/restaurant/homepage", {
      restaurant: restaurant,
      googleMapsUrl: googleMapsUrl,
      menus: menus,
      filters: {},
      categories: categories,
      autEdit: autEdit,
      autGest: autGest,
      comments: comments
    });
  } catch (err) {
    res.status(500).render("errors/error", { numError: 500, error: err });
  }
};

restaurantController.searchMenu = async function (req, res) {
  try {
    let query = {};
    const name = req.query.mameMenu;
    const type = req.query.type;
    const order = req.query.order;

    if (name) {
      query.name = name;
      console.log("Nome do menu: ", name);
    }

    if (type && type !== "all") {
      query.type = type;
    }

    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();

    let menus = [];

    if (restaurant) {
      /*
      O filter ele percorre todos os elementos do array, e para cada elemento chama a função callback
      Se o callback devolver true esse elemento é incluido no array, se retornar false é descartado.

      Object.entries --> converte a query numa lista de pares, [campo, valor], ex: [['name', 'HappyMeals'], ['type', 'carne']]
      .every --> metodo que retornar ture somente se todos os elementos do array, satisfazerem a condição do mesmo
      */
      menus = await restaurant.menus.filter((menu) => {
        return Object.entries(query).every(([field, value]) => {
          return menu[field] === value;
        });
      });

      switch (order) {
        case "nameAsc": {
          menus.sort((a, b) => a.name.localeCompare(b.name));
          break;
        }
        case "nameDesc": {
          menus.sort((a, b) => b.name.localeCompare(a.name));
          break;
        }
        case "typeAsc": {
          menus.sort((a, b) => a.type.localeCompare(b.type));
          break;
        }
        case "typeDesc": {
          menus.sort((a, b) => b.type.localeCompare(a.type));
          break;
        }
        default: {
          break;
        }
      }
    }

    const categories = await carregarCategoriesMenus(menus);

    res.render("restaurants/restaurant/homepage", {
      restaurant: restaurant,
      menus: menus,
      filters: { name, type, order },
      categories: categories,
      autEdit: res.locals.autEdit,
      autGest: res.locals.autGest,
    });
  } catch (error) {
    res.status(500).render("errors/error", { numError: 500, error: error });
  }
};

module.exports = restaurantController;
