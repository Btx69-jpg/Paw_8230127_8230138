var mongoose = require("mongoose");
const multer = require('multer');
const fs = require('fs'); 

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");
const Menu = require("../../Models/Menus/Menu");
const Dish = require("../../Models/Menus/Dish");
const Portion = require("../../Models/Reusable/Portion");

//Controllers
var menuController = {};

//Metodos
const {carregarCategories, carregarCategoriesMenu} = require("../Functions/categories.js");
const {carregarPortions} = require("../Functions/portions.js");

async function saveImage(req, res) {
    return new Promise((resolve, reject) => {
        const storageLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                const menuName = req.body.name.replace(/[^a-zA-Z0-9]/g, '_');
                const pathFolder = `public/images/Restaurants/${req.params.restaurant}/Menus/${menuName}/`;
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
        console.log("Categorias: ", categories);
        res.render("restaurants/restaurant/Menu/menu", { restaurant: restaurant, filters: {}, menu: menu, categories: categories, portions: portions });
    } catch (err) {
      console.error(err);
      res.status(500).render("errors/error", { numError: 500, error: "Erro ao recuperar o menu" });
    }
};

menuController.getMenus = async function(req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
            .populate({
            path: 'menus.dishes'
            })
            .exec();
        
        const menus = restaurant.menus.map(menu => ({
            _id: menu._id,
            name: menu.name,
            dishes: menu.dishes.map(d => ({ _id: d._id, name: d.name, price: d.price }))
        }));

        res.json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
  
//Permite criar um novo menu no restaurante
menuController.createMenu = async function (req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const categories = await carregarCategories();
        const portions = await carregarPortions();

        res.render("restaurants/restaurant/Menu/createMenu", { restaurant: restaurant, categories: categories, portions: portions });
    } catch (err) {
        res.render("errors/error", {numError: 500, error: err});
    }
};

menuController.saveMenu = async function(req, res) {
    try {
        await saveImage(req, res);

        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        if (!restaurant) {
            return res.status(404).send("Restaurante não encontrado");
        }

        // Obter a foto do menu
        const menuPhotoFile = req.files.find(file => file.fieldname === 'menuPhoto');
        const menuPhotoPath = menuPhotoFile ? "/" + menuPhotoFile.path.replace(/^public[\\/]/, "") : null;

        // Mapeia os arquivos pelos índices dos pratos
        const fileMap = {};
        req.files.forEach(file => {
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
                return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                    restaurant, 
                    categories: await carregarCategories(), 
                    portions: await carregarPortions(),
                    error: `Pelo menos uma porção é obrigatória para o prato ${i + 1}`
                });
            }

            if (dishData.portions) {
                const portionPrices = Array.isArray(dishData.portionPrices) ? dishData.portionPrices : [dishData.portionPrices];
                
                dishData.portions.forEach((portionId, idx) => {
                    if (!portionPrices[idx] || isNaN(portionPrices[idx])) {
                        throw new Error(`Preço obrigatório para a porção selecionada no prato ${i + 1}`);
                    }
                    portions.push({
                        portion: portionId,
                        price: parseFloat(portionPrices[idx])
                    });
                });
            }

            if (!file) {
                return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                    restaurant, 
                    categories: await carregarCategories(), 
                    error: `Imagem não encontrada para o prato ${i + 1}.`
                });
            }

            // Verifica duplicatas
            for (let j = i + 1; j < dishes.length; j++) {
                if (dishData.name === dishes[j].name) {
                    return res.status(400).render("restaurants/restaurant/Menu/createMenu", { 
                        restaurant, 
                        categories: await carregarCategories(), 
                        error: "Nomes duplicados não são permitidos."
                    });
                }
            }

            const caminhoCorrigido = "/" + file.path.replace(/^public[\\/]/, "");

            dishObjects.push(new Dish({
                name: dishData.name,
                description: dishData.description,
                category: dishData.category,
                price: dishData.price,
                portions: portions,
                photo: caminhoCorrigido
            }));
        }

        const menu = new Menu({
            name: req.body.name,
            type: req.body.type,
            dishes: dishObjects,
            photo: menuPhotoPath
        });

        restaurant.menus.push(menu);
        await restaurant.save();

        res.redirect("/restaurants/" + restaurant.name);
    } catch (err) {
        console.error(err);
        res.render("errors/error", {numError: 500, error: err.message});
    }
};

// Renderiza a página de edição do menu
menuController.editMenu = async function(req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);
        const categories = await carregarCategories();
        let portions = await carregarPortions();

        if (!menu) {
            return res.status(404).render("errors/error404", { error: "Menu não encontrado" });
        }

        res.render("restaurants/restaurant/Menu/editMenu", {
            restaurant: restaurant,
            menu: menu,
            categories: categories,
            portions: portions,
        });
    } catch (err) {
        res.render("errors/error", {numError: 500, error: err});
    }
};

// Atualiza o menu no banco de dados
menuController.saveEditMenu = async function(req, res) {
    try {
        await saveImage(req, res);
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);
        const portions = await Portion.find({}).exec();

        // Atualiza dados básicos do menu
        menu.name = req.body.name;
        menu.type = req.body.type;

        const menuPhotoFile = req.files.find(file => file.fieldname === 'menuPhoto');
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
            req.files.forEach(file => {
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
                            const prices = Array.isArray(dishData.portionPrices) ? 
                                dishData.portionPrices : 
                                [dishData.portionPrices];
    
                            dishData.portions.forEach((portionId, idx) => {
                                if (!prices[idx] || isNaN(prices[idx])) {
                                    throw new Error(`Preço obrigatório para porção no prato ${existingDish.name}`);
                                }
                                portionsData.push({
                                    portion: portionId,
                                    price: parseFloat(prices[idx])
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
                            existingDish.photo = "/" + existingDishesFiles[index].path.replace(/^public[\\/]/, "");
                        }
                    }
                });
            }
        }

        // Atualiza o tratamento de novos pratos
        if (req.body.newDishes) {
            // Cria um mapa das novas imagens
            const newDishesFiles = {};
            req.files.forEach(file => {
                const match = file.fieldname.match(/newDishes\[(\d+)\]\[photo\]/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    newDishesFiles[index] = file;
                }
            });

            Object.keys(req.body.newDishes).forEach(index => {
                const newDish = req.body.newDishes[index];
                const file = newDishesFiles[index];

                if (!file) {
                    return res.status(400).render("errors/error400", {
                        error: `Imagem obrigatória para o novo prato ${parseInt(index) + 1}`
                    });
                }

                menu.dishes.push(new Dish({
                    name: newDish.name,
                    description: newDish.description,
                    category: newDish.category,
                    price: newDish.price,
                    photo: "/" + file.path.replace(/^public[\\/]/, "")
                }));
            });
            }

        const deletedDishes = Array.isArray(req.body.deletedDishes) 
            ? req.body.deletedDishes 
            : [req.body.deletedDishes].filter(Boolean);

        if (deletedDishes.length > 0) {
            deletedDishes.forEach(dishId => {
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
        res.render("errors/error", {numError: 500, error: err});
    }
};

menuController.deleteMenu = async function(req, res) {
    try {
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const menu = restaurant.menus.id(req.params.menuId);

        if (!menu) {
            return res.status(404).render("errors/error404", { error: "Menu não encontrado" });
        }

        // Apagar foto do menu
        if (menu.photo && fs.existsSync("public" + menu.photo)) {
            fs.unlinkSync("public" + menu.photo);
        }

        // Apagar fotos dos pratos
        menu.dishes.forEach(dish => {
            if (dish.photo && fs.existsSync("public" + dish.photo)) {
                fs.unlinkSync("public" + dish.photo);
            }
        });

        // Remover menu do array
        restaurant.menus.pull(menu);
        await restaurant.save();

        res.redirect(`/restaurants/${restaurant.name}`);
    } catch (err) {
        res.render("errors/error", {numError: 500, error: err});
    }
};

module.exports = menuController;