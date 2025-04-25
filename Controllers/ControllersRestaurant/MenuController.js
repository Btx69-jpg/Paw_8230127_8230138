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

async function saveImage(req, res) {
  return new Promise((resolve, reject) => {
    const storageLogo = multer.diskStorage({
      destination: function (req, file, cb) {
        const menuName = req.body.name.replace(/[^a-zA-Z0-9]/g, "_");
        const pathFolder = `public/images/Restaurants/${req.params.restaurant}/Menus/${menuName}/`;
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

menuController.saveMenu = async function (req, res, restaurant) {
  try {
    //await saveImage(req, res);

    if (req.session.tempData) {
      // Aplicar correções
      req.body = applyCorrections(req.body, req.session.tempData);
    }

    // Obter a foto do menu
    const menuPhotoFile = req.files.find(
      (file) => file.fieldname === "menuPhoto"
    );
    const menuPhotoPath = menuPhotoFile
      ? "/" + menuPhotoFile.path.replace(/^public[\\/]/, "")
      : null;

    // Mapeia os arquivos pelos índices dos pratos
    const fileMap = {};
    req.files.forEach((file) => {
      const match = file.fieldname.match(/dishes\[(\d+)\]\[photo\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        fileMap[index] = file;
      }
    });

    let dishes = req.body.dishes;
    if (!dishes) {
      return res.status(400).send("Nenhum prato foi enviado");
    }

    if (!Array.isArray(dishes)) {
      dishes = [dishes];
    }

    let dishObjects = [];
    for (let i = 0; i < dishes.length; i++) {
      const dishData = dishes[i];
      const file = fileMap[i];

      // Validação de porções
      const portions = [];

      if (dishData.portions.length === 0) {
        return res
          .status(400)
          .render("restaurants/restaurant/Menu/createMenu", {
            restaurant,
            categories: await carregarCategories(),
            portions: await carregarPortions(),
            error: `Pelo menos uma porção é obrigatória para o prato ${i + 1}`,
          });
      }

      const ingredients = Array.isArray(dishData.ingredients)
        ? dishData.ingredients
        : [dishData.ingredients];
      const searchTypes = req.body.searchTypes?.[i] || [];

      const { nutritionalInfo, warnings } = await processIngredients(
        ingredients,
        searchTypes
      );

      if (warnings.length > 0) {
        req.flash("warning_msg", warnings.join(", "));
      }

      if (dishData.portions) {
        const portionPrices = Array.isArray(dishData.portionPrices)
          ? dishData.portionPrices
          : [dishData.portionPrices];

        dishData.portions.forEach((portionId, idx) => {
          if (!portionPrices[idx] || isNaN(portionPrices[idx])) {
            throw new Error(
              `Preço obrigatório para a porção selecionada no prato ${i + 1}`
            );
          }
          portions.push({
            portion: portionId,
            price: parseFloat(portionPrices[idx]),
          });
        });
      }

      if (!file) {
        return res
          .status(400)
          .render("restaurants/restaurant/Menu/createMenu", {
            restaurant,
            categories: await carregarCategories(),
            error: `Imagem não encontrada para o prato ${i + 1}.`,
          });
      }

      // Verifica duplicatas
      for (let j = i + 1; j < dishes.length; j++) {
        if (dishData.name === dishes[j].name) {
          return res
            .status(400)
            .render("restaurants/restaurant/Menu/createMenu", {
              restaurant,
              categories: await carregarCategories(),
              error: "Nomes duplicados não são permitidos.",
            });
        }
      }

      const caminhoCorrigido = "/" + file.path.replace(/^public[\\/]/, "");

      dishObjects.push(
        new Dish({
          name: dishData.name,
          description: dishData.description,
          category: dishData.category,
          price: dishData.price,
          portions: portions,
          photo: caminhoCorrigido,
          nutritionalInfo: nutritionalInfo,
        })
      );
    }

    const menu = new Menu({
      name: req.body.name,
      type: req.body.type,
      dishes: dishObjects,
      photo: menuPhotoPath,
    });

    restaurant.menus.push(menu);
    await restaurant.save();

    res.redirect("/restaurants/" + restaurant.name);
  } catch (err) {
    console.error(err);
    res.render("errors/error", { numError: 500, error: err.message });
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

async function fetchNutritionalData(ingredient, type) {
  try {
    const cacheKey = `${type}:${ingredient}`;
    const cached = nutritionCache.get(cacheKey);
    if (cached) {
      return {
        name: cached.name,
        per100g: cached.per100g,
      };
    }

    let product;
    if (type === "barcode") {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${ingredient}.json`
      );
      product = response.data.product;
    } else {
      const searchResponse = await axios.get(
        "https://world.openfoodfacts.org/cgi/search.pl",
        {
          params: {
            search_terms: ingredient,
            page_size: 1,
            json: 1,
          },
        }
      );
      product = searchResponse.data.products?.[0];
    }

    if (!product || !product.nutriments) {
      return null;
    }

    const result = {
      name: product.product_name || ingredient,
      per100g: {
        calories: product.nutriments["energy-kcal_100g"] || 0,
        protein: product.nutriments.proteins_100g || 0,
        fat: product.nutriments.fat_100g || 0,
        carbohydrates: product.nutriments.carbohydrates_100g || 0,
        sugars: product.nutriments.sugars_100g || 0,
      },
    };

    nutritionCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Erro na busca por ${type}:`, error);
    return null;
  }
}

async function processIngredients(ingredients, searchTypes) {
  try {
    const requests = ingredients.map(async (ingredient, index) => {
      const type = searchTypes[index];
      return fetchNutritionalData(ingredient.trim(), type);
    });

    const results = (await Promise.all(requests)).filter(Boolean); // Filtrar resultados nulos

    if (results.length === 0) return { nutritionalInfo: [], warnings: [] };

    const aggregated = results.reduce(
      (acc, curr) => ({
        calories: acc.calories + (curr.per100g?.calories || 0),
        protein: acc.protein + (curr.per100g?.protein || 0),
        fat: acc.fat + (curr.per100g?.fat || 0),
        carbohydrates: acc.carbohydrates + (curr.per100g?.carbohydrates || 0),
        sugars: acc.sugars + (curr.per100g?.sugars || 0),
      }),
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        sugars: 0,
      }
    );

    return {
      nutritionalInfo: [
        {
          name: "informação_nutricional",
          per100g: aggregated,
        },
      ],
      warnings: [],
    };
  } catch (error) {
    console.error("Erro no processamento de ingredientes:", error);
    return { nutritionalInfo: [], warnings: [error.message] };
  }
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

menuController.validateNutrition = async function (req, res) {
  try {
    await saveImage(req, res);
    
    
    if (!req.body.dishes) {
      console.log("\n\n\n\n\n\n\n\n\n\n DEU MERDA ERRO 400 \n\n\n\n\n\n\n\n\n\n")

      return res.status(404).render("errors/error", {
        numError: 404,
        error: "Dados de pratos ausentes",
      });
    }

    const restaurant = await Restaurant.findOne({
      name: req.params.restaurant,
    }).exec();
    if (!restaurant) {
      return res.status(404).send("Restaurante não encontrado");
    }
    
    const tempData = {
      restaurant: restaurant,
      formData: req.body,
      files: req.files,
      validationErrors: [],
      timestamp: Date.now(),
    };
    

    const dishes = [].concat(req.body.dishes).filter(Boolean);

    console.log("\n\n\n\n\n\n\n\n\n\n" + "\n\n\n\n\n\n\n\n\n\n")
    console.log(dishes)
    console.log("\n\n\n\n\n\n\n\n\n\n" + "\n\n\n\n\n\n\n\n\n\n")


    const hasAnyIngredient = dishes.some(dish =>
      Array.isArray(dish.ingredients)
        ? dish.ingredients.filter(ingredient => (ingredient||"").trim() !== "").length > 0
        : (dish.ingredients || "").trim() !== ""
    );
    
    if (!hasAnyIngredient) {
      // Nenhum prato tem ingredientes: pula validação e salva diretamente
      console.log("\n\n\n\n\n\n\n\n\n\n ENTREI NO SAVE MENU DIRETO")
      return menuController.saveMenu(req, res, restaurant);
    }

    // Processamento paralelo com segurança
    const validationResults = await Promise.all(dishes.map(async (dish, dishIndex) => {
      // Verificar estrutura do prato
      if (!dish || typeof dish !== 'object') {
        console.log("\n\n\n\n\n\n\n\n\n\n DEU MERDA ESTRUTURA DO PRATO \n\n\n\n\n\n\n\n\n\n")
        return [{
          dishIndex,
          error: "Estrutura do prato inválida"
        }];
      }

      // Acessar ingredientes com fallback
      const ingredients = [].concat(dish?.ingredients || []).filter(Boolean);
      const searchTypes = [].concat(req.body?.searchTypes?.[dishIndex] || []);

        // Processar ingredientes em paralelo
        const ingredientResults = await Promise.all(
          ingredients.map(async (ingredient, ingredientIndex) => {
            const type = searchTypes[ingredientIndex] || "name";
            const value = ingredient.trim();

            if (!value) return null;

            try {
              const result = await fetchNutritionalData(value, type);
              return result
                ? null
                : {
                    dishIndex,
                    ingredientIndex,
                    originalValue: value,
                    searchType: type,
                  };
            } catch (error) {
              console.log("\n\n\n\n\n\n\n\n\n\n DEU MERDA ERRO ESTRANHO \n\n\n\n\n\n\n\n\n\n")
              return {
                dishIndex,
                ingredientIndex,
                originalValue: value,
                searchType: type,
                error: error.message,
              };
            }
          })
        );

        return ingredientResults.filter(Boolean);
      })
    );

    // Achatar os resultados
    tempData.validationErrors = validationResults.flat();

    if (tempData.validationErrors.length > 0) {
      req.session.tempData = {
        ...tempData,
        restaurant: restaurant,
        sessionId: req.sessionID,
        attempts: {},
      };
      console.log("\n\n\n\n\n\n\n\n\n\n" + restaurant.name +"\n\n\n\n\n\n\n\n\n\n")
      return res.render("restaurants/restaurant/Menu/confirmNutriData", {
        validationErrors: tempData.validationErrors,
        sessionData: tempData,
        dishes: dishes.map((dish, i) => ({
          index: i,
          name: dish.name,
          ingredients: Array.isArray(dish.ingredients)
            ? dish.ingredients
            : [dish.ingredients],
        })),
      });
    }
    
    // 4) Se não houver erros, chama diretamente o saveMenu original:
    return menuController.saveMenu(req, res, restaurant);
  } catch (error) {
    console.log("\n\n\n\n\n\n\n\n\n\n DEU MERDA ERRO 500 \n\n\n\n\n\n\n\n\n\n")

    console.error("Erro na validação nutricional:", error);
    res.render("errors/error", {
      numError: 500,
      error: "Erro no processo de validação",
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

menuController.saveMenuFinal = async function (req, res) {
  try {
    const tempData = req.session.tempData;

    if (!tempData) {
      throw new Error("Dados temporários não encontrados na sessão");
    }

    // Restaurar dados originais da sessão
    req.body = tempData.formData;
    req.files = tempData.files;

    // Limpar sessão
    delete req.session.tempData;

    // Chamar o método original de salvamento
    return menuController.saveMenu(req, res, tempData.restaurant);
  } catch (error) {
    console.error("Erro no salvamento final:", error);
    res.render("errors/error", {
      numError: 500,
      error: "Erro no processo de salvamento",
    });
  }
};
module.exports = menuController;
