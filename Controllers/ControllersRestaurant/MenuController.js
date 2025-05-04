var mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const axiosRetry = require('axios-retry').default;
const NodeCache = require("node-cache");
const nutritionCache = new NodeCache({ stdTTL: 3600 });

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");
const Menu = require("../../Models/Menus/Menu");
const Dish = require("../../Models/Menus/Dish");
const Portion = require("../../Models/Portion");

axiosRetry(axios, { retries: 3 });
axiosRetry(axios, { retryDelay: axiosRetry.linearDelay() });

//Controllers
var menuController = {};

//Metodos
const { carregarCategories, carregarCategoriesMenu } = require("../Functions/categories.js");
const { carregarPortions } = require("../Functions/portions.js");

// Função para remover um diretorio recursivamente
function cleanupUploadDir(dir) {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Função para salvar a imagem do menu e pratos
async function saveImage(req, res) {
  return new Promise((resolve, reject) => {
      const storageLogo = multer.diskStorage({
          destination: function (req, file, cb) {
              const menuName = req.body.name.replace(/[^a-zA-Z0-9]/g, '_');
              const pathFolder = `public/images/Restaurants/${req.params.restaurant}/Menus/${menuName}/`;
              req.uploadDir = pathFolder;
              fs.mkdirSync(pathFolder, { recursive: true });
              cb(null, pathFolder);
          },
          filename: function (req, file, cb) {
              cb(null, file.originalname);
          }
      });

      const uploadLogo = multer({ 
          storage: storageLogo,
          fileFilter: function (req, file, cb) {
              if (file.mimetype.startsWith('image/')) {
                  cb(null, true);
              } else {
                  cb(new Error('Apenas imagens são permitidas!'), false);
              }
          }
      }).any(); // Processa todos os arquivos

      uploadLogo(req, res, function(err) {
          if (err) {
              console.error('Erro no upload:', err);
              cleanupUploadDir(req.uploadDir);
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
                model: "Portion"
            }).exec();
  
        // Extrai o menu específico a partir do array de menus
        const menu = restaurant.menus.id(req.params.menu);
        if (!menu) {
            return res
            .status(404)
            .render("errors/error404", { error: "Menu não encontrado" });
        }
    
        const categories = await carregarCategoriesMenu(menu);
        const portions = await carregarPortions();
        res.render("restaurants/restaurant/Menu/menu", { restaurant: restaurant, filters: {}, menu: menu, categories: categories, portions: portions });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/error", { numError: 500, error: "Erro ao recuperar o menu" });
    }
  }

//Filtro dos pratos
menuController.searchMenu = async function (req, res) {
    try {
        const dishName = req.query.dishName;
        const category = req.query.category;
        const price = req.query.price;
        const portion = req.query.portion; 
        const order = req.query.order;

        const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
            .populate({
                path: "menus.dishes.portions.portion",
                model: "Portion"
            }).exec();

        // Extrai o menu específico a partir do array de menus
        let menu = restaurant.menus.id(req.params.menu);
        if (!menu) {
            return res
            .status(404)
            .render("errors/error404", { error: "Menu não encontrado" });
        }

        menu.dishes = menu.dishes.filter(dish => {
            if (dishName && dish.name !== dishName) {
                return false;
            }
          
            if (category && category !== 'all' && dish.category !== category) {
                return false;
            }
          
            //Seleção da porção a usar no filtro de preço
            let candidatePortion = null;
            if (portion === 'all') {
                //encontrar a porção de menor preço
                if (dish.portions.length === 0) {
                    return false; 
                }
                
                candidatePortion = dish.portions[0];
                
                for (let i = 1; i < dish.portions.length; i++) {
                    const portionDish = dish.portions[i];
                
                    if (portionDish.price < candidatePortion.price) {
                        candidatePortion = portionDish;
                    }
                }
            } else {
                //procurar a porção específica pelo nome (ou _id)
                candidatePortion = dish.portions.find(dish => {
                    // se fizeste populate, p.portion.portion é o nome
                    
                    if (dish.portion.portion && dish.portion.portion === portion) {
                        return true;
                    }
                    
                    // senão compara o ObjectId
                    return dish.portion.toString() === portion;
                });

                // se não encontrou, descartamos o prato
                if (!candidatePortion) {
                    return false;
                }
            }

            if (price && price > 0 && candidatePortion.price < price) {
                return false;
            }
            
            // passou em todos os filtros
            return true;
        });

        if (order) {
            switch (order) {
                case 'nameAsc': {
                    menu.dishes.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                    break;
                } case 'nameDesc': {
                    menu.dishes.sort((a, b) =>
                        b.name.localeCompare(a.name)
                    );
                    break;
                } case 'typeAsc': {
                    menu.dishes.sort((a, b) =>
                        a.category.localeCompare(b.category)
                    );
                    break;
                } case 'typeDesc': {
                    menu.dishes.sort((a, b) =>
                        b.category.localeCompare(a.category)
                    );
                    break;
                } case 'priceAsc': {
                    menu.dishes.sort(
                        (a, b) =>
                        Math.min(...a.portions.map(p => p.price)) -
                        Math.min(...b.portions.map(p => p.price))
                    );
                    break;   
                } case 'priceDesc': {
                    menu.dishes.sort(
                        (a, b) =>
                        Math.min(...b.portions.map(p => p.price)) -
                        Math.min(...a.portions.map(p => p.price))
                    );
                    break;
                }
            }
        }
    
        console.log("Dishes: ", menu.dishes);
        const categories = await carregarCategoriesMenu(menu);
        const portions = await carregarPortions();
        res.render("restaurants/restaurant/Menu/menu", { restaurant: restaurant, filters: {dishName, category, price, portion, order }, menu: menu, categories: categories, portions: portions });
    } catch (err) {
        res.status(500).render("errors/error", {numError: 500, error: err});
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

// Save menu: reusa dados nutricionaiscda sessao (por a funcionar)
menuController.saveMenu = async function (req, res, restaurant) {
  try {
    const temp = req.session.tempData || {};
    const formData = temp?.formData || req.body;
    const files = temp?.files || req.files;
    const manual   = req.body.manual || {};


  
  if (!restaurant) {
    restaurant = temp.restaurant;
  }
  restaurant = await Restaurant.findOne({ name: restaurant.name }).exec();
  const dishes = [].concat(formData?.dishes || []).filter(Boolean);

  const dishObjects = dishes.map((dish, idx) => {
    const fileInfo = files.find(f => f.fieldname === "dishes[" +idx+ "][photo]");
    const photo = fileInfo ? '/' + fileInfo.path.replace(/^public[\\/]/, '') : null;
    let nutritionalInfo;
    if (manual[idx] && manual[idx] != null && manual[idx] != undefined) {
      // validação mínima
      console.log("\n\n\n\n\nManual: ", manual[idx], "\n\n\n\n\n\n");
      ['calories','protein','fat','carbohydrates','sugars'].forEach(n => {
        if (manual[idx][n] == null || isNaN(manual[idx][n]) || Number(manual[idx][n]) < 0)
          throw new Error("Valor manual para prato ", idx+1, " ", n ,"inválido");
      });
      nutritionalInfo = [{
        name: 'manual',
        per100g: {
          calories: Number(manual[idx].calories),
          protein: Number(manual[idx].protein),
          fat: Number(manual[idx].fat),
          carbohydrates: Number(manual[idx].carbohydrates),
          sugars: Number(manual[idx].sugars)
        }
      }];
    } else {
      // usa dados da API armazenados em temp.perDish
      const infos = temp.perDish?.[idx]?.infos || [];
      nutritionalInfo = infos;
    }
    return new Dish({
      name: dish.name,
      description: dish.description,
      category: dish.category,
      portions: (dish.portions || []).map((p, i) => ({ portion: p, price: parseFloat(dish.portionPrices[i]) })),
      photo: photo,
      nutritionalInfo: nutritionalInfo
    });

    const menuFile = files.find(f => f.fieldname === 'menuPhoto');
    const menuPhoto = menuFile ? '/' + menuFile.path.replace(/^public[\\/]/, '') : null;
    const menu = new Menu({
      name: formData?.name || req.body.name,
      type: formData?.type || req.body.type,
      dishes: dishObjects,
      photo: menuPhoto
    });

  console.log("\n\n\n\n\n\n\n\nrestaur: ", restaurant, "\n\n\n\n\n\n");
  restaurant.menus.push(menu);
  await restaurant.save();

  delete req.session.tempData;
  //testar com o render
  res.redirect('/restaurants/' + restaurant.name);
  } catch (err) {
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
    console.log("\n\n\n\n\n\n\n\nDeleting menu...\n\n\n\n\n\n");
    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    const menu = restaurant.menus.id(req.params.menuId);

    if (!menu) {
      return res
        .status(404)
        .render("errors/error404", { error: "Menu não encontrado" });
    }
    const menuName = menu.name.replace(/[^a-zA-Z0-9]/g, '_');
    const pathFolder = `public/images/Restaurants/${restaurant.name}/Menus/${menuName}/`;
    cleanupUploadDir(pathFolder)
    

    // Remover menu do array
    restaurant.menus.pull(menu);
    await restaurant.save();

    res.redirect(`/restaurants/${restaurant.name}`);
  } catch (err) {
    res.render("errors/error", { numError: 500, error: err });
  }
};

// Fetch dados nutricionais da api OpenFoodFacts
// Se o ingrediente já estiver na cache, retorna os dados armazenados
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

// processa os ingredientes, fetch e agrega as informações nutricionais
async function processIngredients(ingredients, searchTypes) {
  const pedidosAPI = ingredients.map((ing, idx) =>
    fetchNutritionalData(ing.trim(), searchTypes[idx] || 'name')
  );
  const results = (await Promise.all(pedidosAPI)).filter(Boolean);
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

  return {
    infos: results.map(r => ({ name: r.name, per100g: r.per100g })),
    warnings: [],
    aggregated: aggregated
  };
}

menuController.validateNutrition = async function (req, res) {
  try {
  await saveImage(req, res);

  const dishes = [].concat(req.body.dishes || []).filter(Boolean);
  const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
  if (!restaurant) {
    cleanupUploadDir(req.uploadDir);
    return res.status(404).render("errors/error404", { error: "Restaurante não encontrado" });
  }

  let hasIngredient = dishes.some(d =>
    [].concat(d.ingredients || []).some(i => (i || "").trim())
  );
  if (!hasIngredient) {
    console.log("\n\n\n\n\n\n REQ");
    console.log(req.body);
    console.log("\n\n\n\n\n\n");
    return menuController.saveMenu(req, res, restaurant);
  }
  const retryTerms = req.body.retryTerm || {};

  const perDish = await Promise.all(
    dishes.map(async (dish, idx) => {
      if (retryTerms !={} && retryTerms[idx] && retryTerms[idx].length > 0) {
        dish.ingredients = retryTerms[idx].map((term, i) => term || dish.ingredients[i]);
      }
      const ingredients = [].concat(dish.ingredients || []).filter(Boolean);
      const types = [].concat(req.body.searchTypes?.[idx] || []);
      return processIngredients(ingredients, types);
    })
  );

  req.session.tempData = {
    formData: req.body,
    files: req.files.map(f => ({ fieldname: f.fieldname, path: f.path })),
    perDish,
    restaurant: restaurant
  };

  // renderza a página de confirmação com os dados nutricionais
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