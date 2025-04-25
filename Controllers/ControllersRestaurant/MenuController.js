var mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const NodeCache = require("node-cache");
const nutritionCache = new NodeCache({ stdTTL: 3600 });
//const { v4: uuidv4 } = require('uuid');

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");
const Menu = require("../../Models/Menus/Menu");
const Dish = require("../../Models/Menus/Dish");
const Portion = require("../../Models/Reusable/Portion");

//Controllers
var menuController = {};

//Metodos
const { carregarCategories } = require("../Functions/categories.js");
const { carregarPortions } = require("../Functions/portions.js");

// Utility to remove directory recursively
function cleanupUploadDir(dir) {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function saveImage(req, res) {
  return new Promise((resolve, reject) => {
    const storageLogo = multer.diskStorage({
      destination: function (req, file, cb) {
        const menuName = req.body.name.replace(/[^a-zA-Z0-9]/g, "_");
        const pathFolder = `public/images/Restaurants/${req.params.restaurant}/Menus/${menuName}/`;
        req.uploadDir = pathFolder;
        fs.mkdirSync(pathFolder, { recursive: true });
        cb(null, pathFolder);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });

    const uploadLogo = multer({
      storage: storageLogo,
      fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Apenas imagens são permitidas!"), false);
        }
      },
    }).any(); // Processa todos os arquivos

    uploadLogo(req, res, function (err) {
      if (err) {
        console.error("Erro no upload:", err);
        cleanupUploadDir(uploadDir);
        return reject(err);
      }
      resolve();
    });
  });
}

// Permite visualizar um menu específico de um restaurante
menuController.showMenu = async function (req, res) {
  try {
    // Realiza a consulta e popula o caminho aninhado: menus.dishes.portions.portion
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
      .populate({
        path: "menus.dishes.portions.portion",
        model: "Portion",
      })
      .exec();

    // Extrai o menu específico a partir do array de menus
    const menu = restaurant.menus.id(req.params.menu);
    if (!menu) {
      return res
        .status(404)
        .render("errors/error404", { error: "Menu não encontrado" });
    }

    res.render("restaurants/restaurant/Menu/menu", {
      restaurant: restaurant,
      menu: menu,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("errors/error", {
      numError: 500,
      error: "Erro ao recuperar o menu",
    });
  }
};

menuController.getMenus = async function (req, res) {
  try {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
      .populate({
        path: "menus.dishes",
      })
      .exec();

    const menus = restaurant.menus.map((menu) => ({
      _id: menu._id,
      name: menu.name,
      dishes: menu.dishes.map((dish) => ({
        _id: dish._id,
        name: dish.name,
        price: dish.price,
      })),
    }));

    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Permite criar um novo menu no restaurante
menuController.createMenu = async function (req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    const categories = await carregarCategories();
    const portions = await carregarPortions();

    res.render("restaurants/restaurant/Menu/createMenu", {
      restaurant: restaurant,
      categories: categories,
      portions: portions,
    });
  } catch (err) {
    res.render("errors/error", { numError: 500, error: err });
  }
};

// Save menu: reuse nutritional data from session
menuController.saveMenu = async function (req, res, restaurant) {
  try {
  const temp = req.session.tempData || {};
  if (!restaurant) {
    console.log("\n\n\n\n\n\nRestaurant not found in session data.\n\n\n\n\n\n");
    restaurant = temp.restaurant;
  }
  console.log("Restaurant:", restaurant.name, "\n\n\n\n\n\n\n");
  const dishes = [].concat(temp.formData?.dishes || []).filter(Boolean);
  const files = temp.files || [];

  const dishObjects = dishes.map((dish, idx) => {
    const file = files.find(f => f.fieldname === `dishes[${idx}][photo]`);
    const photo = file ? "/" + file.path.replace(/^public\//, "") : null;
    const { infos } = temp.perDish?.[idx] || { infos: [] };
    return new Dish({
      name: dish.name,
      description: dish.description,
      category: dish.category,
      price: dish.price,
      portions: (dish.portions || []).map((p, i) => ({ portion: p, price: parseFloat(dish.portionPrices[i]) })),
      photo,
      nutritionalInfo: infos
    });
  });

  const menu = new Menu({
    name: temp.formData?.name || req.body.name,
    type: temp.formData?.type || req.body.type,
    dishes: dishObjects,
    photo: null
  });


  restaurant.menus.push(menu);
  await restaurant.save();

  delete req.session.tempData;
  //testar com o render
  res.redirect(`/restaurants/${restaurant.name}`);
  }
  catch (err) {
    console.error("Erro ao salvar o menu:", err);
    cleanupUploadDir(req.uploadDir);
    res.render("errors/error", { numError: 500, error: err });
  }
};

// Renderiza a página de edição do menu
menuController.editMenu = async function (req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    const menu = restaurant.menus.id(req.params.menuId);
    const categories = await carregarCategories();
    let portions = await carregarPortions();

    if (!menu) {
      return res
        .status(404)
        .render("errors/error404", { error: "Menu não encontrado" });
    }

    res.render("restaurants/restaurant/Menu/editMenu", {
      restaurant: restaurant,
      menu: menu,
      categories: categories,
      portions: portions,
    });
  } catch (err) {
    res.render("errors/error", { numError: 500, error: err });
  }
};

// Atualiza o menu no banco de dados
menuController.saveEditMenu = async function (req, res) {
  try {
    await saveImage(req, res);
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    const menu = restaurant.menus.id(req.params.menuId);
    const portions = await Portion.find({}).exec();

    // Atualiza dados básicos do menu
    menu.name = req.body.name;
    menu.type = req.body.type;

    const menuPhotoFile = req.files.find(
      (file) => file.fieldname === "menuPhoto"
    );
    if (menuPhotoFile) {
      // Apagar imagem antiga se existir
      if (menu.photo && fs.existsSync("public" + menu.photo)) {
        fs.unlinkSync("public" + menu.photo);
      }
      menu.photo = "/" + menuPhotoFile.path.replace(/^public[\\/]/, "");
    }

    // Atualiza pratos existentes
    if (req.files) {
      // Mapear arquivos para pratos existentes
      const existingDishesFiles = {};
      req.files.forEach((file) => {
        const match = file.fieldname.match(/dishes\[(\d+)\]\[photo\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          existingDishesFiles[index] = file;
        }
      });

      if (req.body.dishes) {
        req.body.dishes.forEach((dishData, index) => {
          const existingDish = menu.dishes.id(dishData._id);

          if (existingDish) {
            existingDish.name = dishData.name;
            existingDish.description = dishData.description;
            existingDish.category = dishData.category;
            existingDish.price = dishData.price;

            const portionsData = [];
            if (dishData.portions) {
              const prices = Array.isArray(dishData.portionPrices)
                ? dishData.portionPrices
                : [dishData.portionPrices];

              dishData.portions.forEach((portionId, idx) => {
                if (!prices[idx] || isNaN(prices[idx])) {
                  throw new Error(
                    `Preço obrigatório para porção no prato ${existingDish.name}`
                  );
                }
                portionsData.push({
                  portion: portionId,
                  price: parseFloat(prices[idx]),
                });
              });
            }

            existingDish.portions = portionsData;

            // Atualizar imagem se houver arquivo para este índice
            if (existingDishesFiles[index]) {
              // Apagar imagem antiga
              if (fs.existsSync("public" + existingDish.photo)) {
                fs.unlinkSync("public" + existingDish.photo);
              }
              existingDish.photo =
                "/" +
                existingDishesFiles[index].path.replace(/^public[\\/]/, "");
            }
          }
        });
      }
    }

    // Atualiza o tratamento de novos pratos
    if (req.body.newDishes) {
      // Cria um mapa das novas imagens
      const newDishesFiles = {};
      req.files.forEach((file) => {
        const match = file.fieldname.match(/newDishes\[(\d+)\]\[photo\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          newDishesFiles[index] = file;
        }
      });

      Object.keys(req.body.newDishes).forEach((index) => {
        const newDish = req.body.newDishes[index];
        const file = newDishesFiles[index];

        if (!file) {
          return res.status(400).render("errors/error400", {
            error: `Imagem obrigatória para o novo prato ${
              parseInt(index) + 1
            }`,
          });
        }

        menu.dishes.push(
          new Dish({
            name: newDish.name,
            description: newDish.description,
            category: newDish.category,
            price: newDish.price,
            photo: "/" + file.path.replace(/^public[\\/]/, ""),
          })
        );
      });
    }

    const deletedDishes = Array.isArray(req.body.deletedDishes)
      ? req.body.deletedDishes
      : [req.body.deletedDishes].filter(Boolean);

    if (deletedDishes.length > 0) {
      deletedDishes.forEach((dishId) => {
        const dishToRemove = menu.dishes.id(dishId);
        if (dishToRemove) {
          if (fs.existsSync("public" + dishToRemove.photo)) {
            fs.unlinkSync("public" + dishToRemove.photo);
          }
          menu.dishes.remove(dishToRemove);
        }
      });
    }

    await restaurant.save();
    res.redirect(`/restaurants/${restaurant.name}/showMenu/${menu._id}`);
  } catch (err) {
    res.render("errors/error", { numError: 500, error: err });
  }
};

menuController.deleteMenu = async function (req, res) {
  try {
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    const menu = restaurant.menus.id(req.params.menuId);

    if (!menu) {
      return res
        .status(404)
        .render("errors/error404", { error: "Menu não encontrado" });
    }

    // Apagar foto do menu
    if (menu.photo && fs.existsSync("public" + menu.photo)) {
      fs.unlinkSync("public" + menu.photo);
    }

    // Apagar fotos dos pratos
    menu.dishes.forEach((dish) => {
      if (dish.photo && fs.existsSync("public" + dish.photo)) {
        fs.unlinkSync("public" + dish.photo);
      }
    });

    // Remover menu do array
    restaurant.menus.pull(menu);
    await restaurant.save();

    res.redirect(`/restaurants/${restaurant.name}`);
  } catch (err) {
    res.render("errors/error", { numError: 500, error: err });
  }
};

// Fetch nutritional data from OpenFoodFacts with caching
async function fetchNutritionalData(ingredient, type) {
  const cacheKey = `${type}:${ingredient}`;
  const cached = nutritionCache.get(cacheKey);
  if (cached) return cached;

  let product;
  if (type === "barcode") {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${ingredient}.json`,
      { timeout: 120000 }
    );
    product = response.data.product;
  } else {
    const response = await axios.get(
      "https://world.openfoodfacts.org/cgi/search.pl",
      {
        params: { search_terms: ingredient, page_size: 1, json: 1 },
        timeout: 120000
      }
    );
    product = response.data.products?.[0];
  }

  if (!product || !product.nutriments) return null;

  const result = {
    name: product.product_name || ingredient,
    per100g: {
      calories: product.nutriments["energy-kcal_100g"] || 0,
      protein: product.nutriments.proteins_100g || 0,
      fat: product.nutriments.fat_100g || 0,
      carbohydrates: product.nutriments.carbohydrates_100g || 0,
      sugars: product.nutriments.sugars_100g || 0
    }
  };

  nutritionCache.set(cacheKey, result);
  return result;
}

// Process ingredients: fetch and aggregate nutritional info
async function processIngredients(ingredients, searchTypes) {
  const tasks = ingredients.map((ing, idx) =>
    fetchNutritionalData(ing.trim(), searchTypes[idx] || 'name')
  );
  const results = (await Promise.all(tasks)).filter(Boolean);
  if (results.length === 0) return { infos: [], warnings: [] };

  const aggregated = results.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.per100g.calories,
      protein: acc.protein + curr.per100g.protein,
      fat: acc.fat + curr.per100g.fat,
      carbohydrates: acc.carbohydrates + curr.per100g.carbohydrates,
      sugars: acc.sugars + curr.per100g.sugars
    }),
    { calories: 0, protein: 0, fat: 0, carbohydrates: 0, sugars: 0 }
  );

  // Return both individual infos and aggregated warnings
  return {
    infos: results.map(r => ({ name: r.name, per100g: r.per100g })),
    warnings: []
  };
}

function applyCorrections(currentBody, tempData) {
  const corrections = currentBody.corrections || [];

  // Processar correções em paralelo
  const updates = corrections.map(async (dishCorrections, dishIndex) => {
    const dish = tempData.formData.dishes[dishIndex];

    const ingredientUpdates = dishCorrections.map(
      async (correction, ingredientIndex) => {
        if (correction.skip) {
          dish.ingredients.splice(ingredientIndex, 1);
          if (tempData.formData.searchTypes[dishIndex]) {
            tempData.formData.searchTypes[dishIndex].splice(ingredientIndex, 1);
          }
        } else {
          dish.ingredients[ingredientIndex] = correction.value;
          if (tempData.formData.searchTypes[dishIndex]) {
            tempData.formData.searchTypes[dishIndex][ingredientIndex] =
              correction.type;
          }
        }
      }
    );

    await Promise.all(ingredientUpdates);
  });

  Promise.all(updates);

  return tempData.formData;
}

// Validate ingredients and fetch nutritional data (once)
menuController.validateNutrition = async function (req, res) {
  try {
  await saveImage(req, res);

  const dishes = [].concat(req.body.dishes || []).filter(Boolean);
  const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
  if (!restaurant) {
    cleanupUploadDir(req.uploadDir);
    return res.status(404).render("errors/error404", { error: "Restaurante não encontrado" });
  }
  // Skip if no ingredients present
  const hasIngredient = dishes.some(d =>
    [].concat(d.ingredients || []).some(i => (i || "").trim())
  );
  if (!hasIngredient) {
    return menuController.saveMenu(req, res, restaurant);
  }

  // Fetch nutritional data per dish
  const perDish = await Promise.all(
    dishes.map(async (dish, idx) => {
      const ingredients = [].concat(dish.ingredients || []).filter(Boolean);
      const types = [].concat(req.body.searchTypes?.[idx] || []);
      return processIngredients(ingredients, types);
    })
  );

  // Store temp data in session for confirmation and reuse
  req.session.tempData = {
    formData: req.body,
    files: req.files,
    perDish,
    restaurant: restaurant
  };

  // Render confirmation page with perDish data
  res.render("restaurants/restaurant/Menu/confirmNutriData", {
    dishes,
    perDish,
    sessionData: req.session.tempData
  });
  }
  catch (error) {
    cleanupUploadDir(req.uploadDir);
    console.error("Erro ao validar ingredientes:", error);
    res.status(500).render("errors/error", {
      numError: 500,
      error: "Erro ao validar ingredientes",
    });
  }
};

menuController.validateIngredient = async function (req, res) {
  try {
    const { type, value } = req.body;
    const result = await fetchNutritionalData(value, type);

    res.json({
      valid: !!result,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

menuController.saveMenuFinal = (req, res) => menuController.saveMenu(req, res, req.session.tempData.restaurant);

module.exports = menuController;
